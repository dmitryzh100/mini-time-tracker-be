import { z } from 'zod';

import { FieldNames, Messages, Validation } from '@common/constants';
import { TimeEntryField } from '../enums';

const rules = {
  hours: Validation.timeEntry(TimeEntryField.Hours),
  description: Validation.timeEntry(TimeEntryField.Description),
  projectId: Validation.timeEntry(TimeEntryField.ProjectId),
};

const fields = {
  hours: FieldNames.timeEntry(TimeEntryField.Hours),
  description: FieldNames.timeEntry(TimeEntryField.Description),
  projectId: FieldNames.timeEntry(TimeEntryField.ProjectId),
  date: FieldNames.timeEntry(TimeEntryField.Date),
};

export const updateTimeEntrySchema = z.object({
  date: z.iso.date({ error: Messages.date(fields.date) }).optional(),
  hours: z
    .number()
    .positive({ error: Messages.positive(fields.hours) })
    .max(rules.hours.max!, {
      error: Messages.max(fields.hours, rules.hours.max!),
    })
    .optional(),
  description: z
    .string()
    .min(rules.description.minLength!, {
      error: Messages.minLength(
        fields.description,
        rules.description.minLength!,
      ),
    })
    .max(rules.description.maxLength!, {
      error: Messages.maxLength(
        fields.description,
        rules.description.maxLength!,
      ),
    })
    .optional(),
  projectId: z
    .number()
    .int({ error: Messages.integer(fields.projectId) })
    .positive({ error: Messages.positive(fields.projectId) })
    .optional(),
});

export type UpdateTimeEntryDto = z.infer<typeof updateTimeEntrySchema>;
