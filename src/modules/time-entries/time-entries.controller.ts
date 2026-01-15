import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TimeEntry } from '@prisma/client';
import { HttpStatusCode } from '@common/constants';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import {
  CurrentUser,
  CurrentUserData,
} from '@modules/auth/decorators/current-user.decorator';
import { Public } from '@modules/auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '@modules/auth/guards/optional-jwt-auth.guard';
import { TimeEntryMessages } from './constants';
import { CreateTimeEntryApiDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryApiDto } from './dto/update-time-entry.dto';
import { createTimeEntrySchema, updateTimeEntrySchema } from './schemas';
import type { CreateTimeEntryDto, UpdateTimeEntryDto } from './schemas';
import {
  GroupedEntriesResponse,
  TimeEntriesService,
} from './time-entries.service';

@ApiTags('time-entries')
@Controller('time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new time entry' })
  @ApiBody({ type: CreateTimeEntryApiDto })
  @ApiResponse({
    status: HttpStatusCode.CREATED,
    description: 'Time entry created successfully',
  })
  @ApiResponse({
    status: HttpStatusCode.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiResponse({
    status: HttpStatusCode.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: HttpStatusCode.NOT_FOUND,
    description: 'Project not found',
  })
  async create(
    @Body(new ZodValidationPipe(createTimeEntrySchema)) dto: CreateTimeEntryDto,
    @CurrentUser('id') userId: number,
  ): Promise<TimeEntry> {
    return this.timeEntriesService.create(dto, userId);
  }

  @Public()
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all time entries grouped by date' })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Returns all time entries grouped by date with totals',
  })
  async findAllGrouped(
    @CurrentUser() user: CurrentUserData | null,
  ): Promise<GroupedEntriesResponse> {
    return this.timeEntriesService.findAllGroupedByDate(user?.id);
  }

  @Public()
  @Get('all')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all time entries (flat list)' })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Returns all time entries',
  })
  async findAll(
    @CurrentUser() user: CurrentUserData | null,
  ): Promise<TimeEntry[]> {
    return this.timeEntriesService.findAll(user?.id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a time entry by ID' })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Returns the time entry',
  })
  @ApiResponse({
    status: HttpStatusCode.NOT_FOUND,
    description: 'Time entry not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TimeEntry | null> {
    const entry = await this.timeEntriesService.findOne(id);

    if (!entry) {
      throw new NotFoundException(TimeEntryMessages.notFound(id));
    }

    return entry;
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a time entry' })
  @ApiBody({ type: UpdateTimeEntryApiDto })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Time entry updated successfully',
  })
  @ApiResponse({
    status: HttpStatusCode.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiResponse({
    status: HttpStatusCode.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: HttpStatusCode.FORBIDDEN,
    description: 'Not authorized to update this entry',
  })
  @ApiResponse({
    status: HttpStatusCode.NOT_FOUND,
    description: 'Time entry or project not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateTimeEntrySchema)) dto: UpdateTimeEntryDto,
    @CurrentUser('id') userId: number,
  ): Promise<TimeEntry> {
    await this.verifyOwnership(id, userId);

    return this.timeEntriesService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a time entry' })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Time entry deleted successfully',
  })
  @ApiResponse({
    status: HttpStatusCode.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: HttpStatusCode.FORBIDDEN,
    description: 'Not authorized to delete this entry',
  })
  @ApiResponse({
    status: HttpStatusCode.NOT_FOUND,
    description: 'Time entry not found',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ): Promise<TimeEntry> {
    await this.verifyOwnership(id, userId);

    return this.timeEntriesService.remove(id);
  }

  private async verifyOwnership(
    entryId: number,
    userId: number,
  ): Promise<void> {
    const entry = await this.timeEntriesService.findOne(entryId);

    if (!entry) {
      throw new NotFoundException(TimeEntryMessages.notFound(entryId));
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException(TimeEntryMessages.notOwner());
    }
  }
}
