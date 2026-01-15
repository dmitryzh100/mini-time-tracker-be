import { TimeEntryField } from '../enums';

export const timeEntryFieldNames: Record<TimeEntryField, string> = {
  [TimeEntryField.Date]: 'Date',
  [TimeEntryField.Hours]: 'Hours',
  [TimeEntryField.Description]: 'Description',
  [TimeEntryField.ProjectId]: 'Project',
};
