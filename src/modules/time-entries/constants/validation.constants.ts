import type { ValidationRule } from '@common/interfaces';
import { TimeEntryField } from '../enums';

export const timeEntryValidationRules: Record<TimeEntryField, ValidationRule> =
  {
    [TimeEntryField.Date]: {},
    [TimeEntryField.Hours]: {
      min: 0.1,
      max: 24,
    },
    [TimeEntryField.Description]: {
      minLength: 1,
      maxLength: 500,
    },
    [TimeEntryField.ProjectId]: {
      min: 1,
    },
  };
