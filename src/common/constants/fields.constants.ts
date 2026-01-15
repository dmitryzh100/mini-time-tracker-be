import { AttachmentField, LeaveField } from '@modules/leaves/enums';
import {
  attachmentFieldNames,
  leaveFieldNames,
} from '@modules/leaves/constants';
import { ProjectField } from '@modules/projects/enums';
import { projectFieldNames } from '@modules/projects/constants';
import { TimeEntryField } from '@modules/time-entries/enums';
import { timeEntryFieldNames } from '@modules/time-entries/constants';
import { UserField } from '@modules/users/enums';
import { userFieldNames } from '@modules/users/constants';

export const FieldNames = {
  user: (field: UserField): string => userFieldNames[field],

  timeEntry: (field: TimeEntryField): string => timeEntryFieldNames[field],

  project: (field: ProjectField): string => projectFieldNames[field],

  leave: (field: LeaveField): string => leaveFieldNames[field],

  attachment: (field: AttachmentField): string => attachmentFieldNames[field],
} as const;
