import type { ValidationRule } from '@common/interfaces';
import { AttachmentField, LeaveField } from '@modules/leaves/enums';
import {
  attachmentValidationRules,
  leaveValidationRules,
} from '@modules/leaves/constants';
import { ProjectField } from '@modules/projects/enums';
import { projectValidationRules } from '@modules/projects/constants';
import { TimeEntryField } from '@modules/time-entries/enums';
import { timeEntryValidationRules } from '@modules/time-entries/constants';
import { UserField } from '@modules/users/enums';
import { userValidationRules } from '@modules/users/constants';

export const Validation = {
  user: (field: UserField): ValidationRule => userValidationRules[field],

  timeEntry: (field: TimeEntryField): ValidationRule =>
    timeEntryValidationRules[field],

  project: (field: ProjectField): ValidationRule =>
    projectValidationRules[field],

  leave: (field: LeaveField): ValidationRule => leaveValidationRules[field],

  attachment: (field: AttachmentField): ValidationRule =>
    attachmentValidationRules[field],
} as const;
