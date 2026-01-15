import { Messages } from '@common/constants';

import { TimeEntryField } from '../enums';
import { timeEntryValidationRules } from './validation.constants';

const ENTITY = 'Time entry';
const PROJECT_ENTITY = 'Project';
const MAX_DAILY_HOURS = timeEntryValidationRules[TimeEntryField.Hours].max!;

export const TimeEntryMessages = {
  notOwner: (): string => Messages.notOwner('time entries'),

  created: (): string => Messages.created(ENTITY),

  updated: (): string => Messages.updated(ENTITY),

  deleted: (): string => Messages.deleted(ENTITY),

  notFound: (id: number): string => Messages.notFound(ENTITY, id),

  projectNotFound: (id: number): string =>
    Messages.notFound(PROJECT_ENTITY, id),

  exceedsDailyLimit: (date: string): string =>
    `Total hours for ${date} would exceed ${MAX_DAILY_HOURS} hours`,

  dailyHoursLimitExceeded: (
    requestedHours: number,
    currentTotal: number,
    availableHours: number,
  ): string =>
    `Cannot add ${requestedHours} hours. Maximum ${MAX_DAILY_HOURS} hours per day allowed. ` +
    `Current total: ${currentTotal} hours. Available: ${availableHours.toFixed(2)} hours.`,
} as const;
