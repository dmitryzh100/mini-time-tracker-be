import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { HttpStatusCode } from '@common/constants';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import {
  ALLOWED_MIME_TYPES,
  LeaveMessages,
  MAX_FILE_SIZE,
  MAX_FILES_PER_LEAVE,
} from './constants';
import { CreateLeaveApiDto } from './dto/create-leave.dto';
import { UpdateLeaveApiDto } from './dto/update-leave.dto';
import { LeavesService, LeaveWithAttachments } from './leaves.service';
import { createLeaveSchema, updateLeaveSchema } from './schemas';

@ApiTags('Leaves')
@ApiBearerAuth('JWT-auth')
@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new leave request' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['SICK_LEAVE', 'DAY_OFF'],
        },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        reason: { type: 'string' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['type', 'startDate', 'endDate'],
    },
  })
  @ApiResponse({
    status: HttpStatusCode.CREATED,
    description: 'Leave request created',
  })
  @UseInterceptors(FilesInterceptor('files', MAX_FILES_PER_LEAVE))
  async create(
    @Body() body: CreateLeaveApiDto,
    @CurrentUser('id') userId: number,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<LeaveWithAttachments> {
    const validatedFiles = this.validateFiles(files);
    const dto = this.parseAndValidateDto(body, createLeaveSchema);

    return this.leavesService.create(dto, userId, validatedFiles);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leave requests for the current user' })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'List of leave requests',
  })
  async findAll(
    @CurrentUser('id') userId: number,
  ): Promise<LeaveWithAttachments[]> {
    return this.leavesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific leave request' })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Leave request details',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LeaveWithAttachments> {
    return this.leavesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a leave request' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['SICK_LEAVE', 'DAY_OFF'],
        },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        reason: { type: 'string' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Leave request updated',
  })
  @UseInterceptors(FilesInterceptor('files', MAX_FILES_PER_LEAVE))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateLeaveApiDto,
    @CurrentUser('id') userId: number,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<LeaveWithAttachments> {
    const validatedFiles = this.validateFiles(files);
    const dto = this.parseAndValidateDto(body, updateLeaveSchema);

    return this.leavesService.update(id, dto, userId, validatedFiles);
  }

  @Delete(':id')
  @HttpCode(HttpStatusCode.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a leave request' })
  @ApiResponse({
    status: HttpStatusCode.NO_CONTENT,
    description: 'Leave request deleted',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ): Promise<void> {
    return this.leavesService.remove(id, userId);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Add attachments to a leave request' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: HttpStatusCode.CREATED,
    description: 'Attachments added',
  })
  @UseInterceptors(FilesInterceptor('files', MAX_FILES_PER_LEAVE))
  async addAttachments(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<LeaveWithAttachments> {
    const validatedFiles = this.validateFiles(files);

    if (!validatedFiles?.length) {
      throw new BadRequestException(LeaveMessages.fileRequired());
    }

    return this.leavesService.addAttachments(id, userId, validatedFiles);
  }

  @Get(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Download an attachment' })
  @ApiResponse({ status: HttpStatusCode.OK, description: 'File download' })
  async downloadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @CurrentUser('id') userId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { attachment, buffer } = await this.leavesService.getAttachmentData(
      id,
      attachmentId,
      userId,
    );

    res.set({
      'Content-Type': attachment.mimeType,
      'Content-Disposition': `attachment; filename="${attachment.originalName}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Delete(':id/attachments/:attachmentId')
  @HttpCode(HttpStatusCode.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an attachment' })
  @ApiResponse({
    status: HttpStatusCode.NO_CONTENT,
    description: 'Attachment deleted',
  })
  async removeAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @CurrentUser('id') userId: number,
  ): Promise<void> {
    return this.leavesService.removeAttachment(id, attachmentId, userId);
  }

  private validateFiles(
    files?: Express.Multer.File[],
  ): Express.Multer.File[] | undefined {
    if (!files?.length) {
      return undefined;
    }

    for (const file of files) {
      if (
        !ALLOWED_MIME_TYPES.includes(
          file.mimetype as (typeof ALLOWED_MIME_TYPES)[number],
        )
      ) {
        throw new BadRequestException(
          LeaveMessages.invalidFileType(ALLOWED_MIME_TYPES.join(', ')),
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(LeaveMessages.fileTooLarge('10MB'));
      }
    }

    return files;
  }

  private parseAndValidateDto<T>(
    body: object,
    schema: { parse: (data: unknown) => T },
  ): T {
    return schema.parse(body);
  }
}
