import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveAttachment, LeaveType } from '@prisma/client';
import * as zlib from 'zlib';
import { promisify } from 'util';

import { SortOrder } from '@common/enums';
import { PrismaService } from '@database/prisma/prisma.service';
import { LeaveMessages, MAX_FILES_PER_LEAVE } from './constants';
import type { CreateLeaveDto, UpdateLeaveDto } from './schemas';
import { LeaveWithAttachments } from './interfaces';

export type { LeaveWithAttachments };

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

@Injectable()
export class LeavesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateLeaveDto,
    userId: number,
    files?: Express.Multer.File[],
  ): Promise<LeaveWithAttachments> {
    await this.checkOverlappingLeaves(
      userId,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );

    if (dto.type === LeaveType.SICK_LEAVE && !files?.length) {
      throw new BadRequestException(LeaveMessages.attachmentRequired());
    }

    const leave = await this.prisma.leave.create({
      data: {
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
        userId,
      },
      include: {
        attachments: true,
      },
    });

    if (files && files.length > 0) {
      await this.saveAttachments(leave.id, files);

      return this.prisma.leave.findUniqueOrThrow({
        where: { id: leave.id },
        include: { attachments: true },
      });
    }

    return leave;
  }

  async findAll(userId?: number): Promise<LeaveWithAttachments[]> {
    return this.prisma.leave.findMany({
      where: userId ? { userId } : undefined,
      include: {
        attachments: true,
      },
      orderBy: { startDate: SortOrder.Desc },
    });
  }

  async findOne(id: number): Promise<LeaveWithAttachments> {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: {
        attachments: true,
      },
    });

    if (!leave) {
      throw new NotFoundException(LeaveMessages.notFound(id));
    }

    return leave;
  }

  async update(
    id: number,
    dto: UpdateLeaveDto,
    userId: number,
    files?: Express.Multer.File[],
  ): Promise<LeaveWithAttachments> {
    const leave = await this.findOne(id);

    if (leave.userId !== userId) {
      throw new ForbiddenException(LeaveMessages.notOwner());
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : leave.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : leave.endDate;

    if (dto.startDate || dto.endDate) {
      await this.checkOverlappingLeaves(userId, startDate, endDate, id);
    }

    const newType = dto.type ?? leave.type;

    if (
      newType === LeaveType.SICK_LEAVE &&
      !leave.attachments.length &&
      !files?.length
    ) {
      throw new BadRequestException(LeaveMessages.attachmentRequired());
    }

    await this.prisma.leave.update({
      where: { id },
      data: {
        type: dto.type,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        reason: dto.reason,
      },
    });

    if (files && files.length > 0) {
      const currentAttachmentCount = leave.attachments.length;

      if (currentAttachmentCount + files.length > MAX_FILES_PER_LEAVE) {
        throw new BadRequestException(
          LeaveMessages.tooManyFiles(MAX_FILES_PER_LEAVE),
        );
      }

      await this.saveAttachments(id, files);
    }

    return this.prisma.leave.findUniqueOrThrow({
      where: { id },
      include: { attachments: true },
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    const leave = await this.findOne(id);

    if (leave.userId !== userId) {
      throw new ForbiddenException(LeaveMessages.notOwner());
    }

    await this.prisma.leave.delete({ where: { id } });
  }

  async addAttachments(
    leaveId: number,
    userId: number,
    files: Express.Multer.File[],
  ): Promise<LeaveWithAttachments> {
    const leave = await this.findOne(leaveId);

    if (leave.userId !== userId) {
      throw new ForbiddenException(LeaveMessages.notOwner());
    }

    if (leave.attachments.length + files.length > MAX_FILES_PER_LEAVE) {
      throw new BadRequestException(
        LeaveMessages.tooManyFiles(MAX_FILES_PER_LEAVE),
      );
    }

    await this.saveAttachments(leaveId, files);

    return this.prisma.leave.findUniqueOrThrow({
      where: { id: leaveId },
      include: { attachments: true },
    });
  }

  async removeAttachment(
    leaveId: number,
    attachmentId: number,
    userId: number,
  ): Promise<void> {
    const leave = await this.findOne(leaveId);

    if (leave.userId !== userId) {
      throw new ForbiddenException(LeaveMessages.notOwner());
    }

    const attachment = leave.attachments.find((a) => a.id === attachmentId);

    if (!attachment) {
      throw new NotFoundException(LeaveMessages.attachmentNotFound());
    }

    if (leave.type === LeaveType.SICK_LEAVE && leave.attachments.length === 1) {
      throw new BadRequestException(LeaveMessages.attachmentRequired());
    }

    await this.prisma.leaveAttachment.delete({ where: { id: attachmentId } });
  }

  async getAttachmentData(
    leaveId: number,
    attachmentId: number,
    userId: number,
  ): Promise<{ attachment: LeaveAttachment; buffer: Buffer }> {
    const leave = await this.findOne(leaveId);

    if (leave.userId !== userId) {
      throw new ForbiddenException(LeaveMessages.notOwner());
    }

    const attachment = leave.attachments.find((a) => a.id === attachmentId);

    if (!attachment) {
      throw new NotFoundException(LeaveMessages.attachmentNotFound());
    }

    const buffer = await this.decompressData(attachment.data);

    return { attachment, buffer };
  }

  private async checkOverlappingLeaves(
    userId: number,
    startDate: Date,
    endDate: Date,
    excludeId?: number,
  ): Promise<void> {
    const overlapping = await this.prisma.leave.findFirst({
      where: {
        userId,
        id: excludeId ? { not: excludeId } : undefined,
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException(LeaveMessages.overlappingLeave());
    }
  }

  private async saveAttachments(
    leaveId: number,
    files: Express.Multer.File[],
  ): Promise<void> {
    for (const file of files) {
      const filename = `${leaveId}-${Date.now()}-${file.originalname}`;
      const compressedData = await this.compressData(file.buffer);

      await this.prisma.leaveAttachment.create({
        data: {
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          data: compressedData,
          leaveId,
        },
      });
    }
  }

  private async compressData(buffer: Buffer): Promise<string> {
    const compressed = await gzip(buffer);

    return compressed.toString('base64');
  }

  private async decompressData(base64Data: string): Promise<Buffer> {
    const compressed = Buffer.from(base64Data, 'base64');

    return gunzip(compressed);
  }
}
