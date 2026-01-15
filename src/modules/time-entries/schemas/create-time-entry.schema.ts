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

export const createTimeEntrySchema = z.object({
  date: z.iso.date({ error: Messages.date(fields.date) }),
  hours: z
    .number({ error: Messages.required(fields.hours) })
    .positive({ error: Messages.positive(fields.hours) })
    .max(rules.hours.max!, {
      error: Messages.max(fields.hours, rules.hours.max!),
    }),
  description: z
    .string({ error: Messages.required(fields.description) })
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
    }),
  projectId: z
    .number({ error: Messages.required(fields.projectId) })
    .int({ error: Messages.integer(fields.projectId) })
    .positive({ error: Messages.positive(fields.projectId) }),
});

export type CreateTimeEntryDto = z.infer<typeof createTimeEntrySchema>;
