import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TimeEntry } from '@prisma/client';

import { SortOrder } from '@common/enums';
import { PrismaService } from '@database/prisma/prisma.service';
import { TimeEntryMessages, timeEntryValidationRules } from './constants';
import { TimeEntryField } from './enums';
import { CreateTimeEntryDto, UpdateTimeEntryDto } from './schemas';

const MAX_DAILY_HOURS = timeEntryValidationRules[TimeEntryField.Hours].max!;

interface TimeEntryWithProject extends TimeEntry {
  project: {
    id: number;
    name: string;
  };
}

interface GroupedEntry {
  date: string;
  totalHours: number;
  entries: TimeEntryWithProject[];
}

export interface GroupedEntriesResponse {
  groupedEntries: GroupedEntry[];
  grandTotal: number;
}

@Injectable()
export class TimeEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTimeEntryDto, userId: number): Promise<TimeEntry> {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException(
        TimeEntryMessages.projectNotFound(dto.projectId),
      );
    }

    const entryDate = new Date(dto.date);
    await this.validateDailyHoursLimit(entryDate, dto.hours, userId);

    return this.prisma.timeEntry.create({
      data: {
        date: entryDate,
        hours: dto.hours,
        description: dto.description,
        projectId: dto.projectId,
        userId,
      },
    });
  }

  async findAll(userId?: number): Promise<TimeEntry[]> {
    return this.prisma.timeEntry.findMany({
      where: userId ? { userId } : {},
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ date: SortOrder.Desc }, { createdAt: SortOrder.Desc }],
    });
  }

  async findAllGroupedByDate(userId?: number): Promise<GroupedEntriesResponse> {
    const entries = await this.prisma.timeEntry.findMany({
      where: userId ? { userId } : {},
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ date: SortOrder.Desc }, { createdAt: SortOrder.Desc }],
    });

    const grouped = new Map<string, TimeEntryWithProject[]>();

    for (const entry of entries) {
      const dateKey = entry.date.toISOString().split('T')[0];

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }

      grouped.get(dateKey)!.push(entry as TimeEntryWithProject);
    }

    let grandTotal = 0;
    const groupedEntries: GroupedEntry[] = [];

    for (const [date, dateEntries] of grouped) {
      const totalHours = dateEntries.reduce(
        (sum, entry) => sum + entry.hours,
        0,
      );
      grandTotal += totalHours;

      groupedEntries.push({
        date,
        totalHours,
        entries: dateEntries,
      });
    }

    return { groupedEntries, grandTotal };
  }

  async findOne(id: number): Promise<TimeEntry | null> {
    return this.prisma.timeEntry.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async update(
    id: number,
    dto: UpdateTimeEntryDto,
    userId: number,
  ): Promise<TimeEntry> {
    const existing = await this.prisma.timeEntry.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(TimeEntryMessages.notFound(id));
    }

    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });

      if (!project) {
        throw new NotFoundException(
          TimeEntryMessages.projectNotFound(dto.projectId),
        );
      }
    }

    const entryDate = dto.date ? new Date(dto.date) : existing.date;
    const newHours = dto.hours ?? existing.hours;

    if (dto.date || dto.hours) {
      await this.validateDailyHoursLimit(entryDate, newHours, userId, id);
    }

    return this.prisma.timeEntry.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        hours: dto.hours,
        description: dto.description,
        projectId: dto.projectId,
      },
    });
  }

  async remove(id: number): Promise<TimeEntry> {
    const existing = await this.prisma.timeEntry.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(TimeEntryMessages.notFound(id));
    }

    return this.prisma.timeEntry.delete({
      where: { id },
    });
  }

  private async validateDailyHoursLimit(
    date: Date,
    hours: number,
    userId: number,
    excludeEntryId?: number,
  ): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingEntries = await this.prisma.timeEntry.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(excludeEntryId && { id: { not: excludeEntryId } }),
      },
    });

    const totalExistingHours = existingEntries.reduce(
      (sum, entry) => sum + entry.hours,
      0,
    );

    if (totalExistingHours + hours > MAX_DAILY_HOURS) {
      const availableHours = Math.max(0, MAX_DAILY_HOURS - totalExistingHours);

      throw new BadRequestException(
        TimeEntryMessages.dailyHoursLimitExceeded(
          hours,
          totalExistingHours,
          availableHours,
        ),
      );
    }
  }
}
