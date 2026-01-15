import type { ValidationRule } from '@common/interfaces';
import { AttachmentField, LeaveField } from '../enums';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_FILES_PER_LEAVE = 5;

export const leaveValidationRules: Record<LeaveField, ValidationRule> = {
  [LeaveField.Type]: {},
  [LeaveField.StartDate]: {},
  [LeaveField.EndDate]: {},
  [LeaveField.Reason]: {
    maxLength: 500,
  },
};

export const attachmentValidationRules: Record<
  AttachmentField,
  ValidationRule
> = {
  [AttachmentField.File]: {},
  [AttachmentField.Filename]: {
    maxLength: 255,
  },
  [AttachmentField.MimeType]: {},
  [AttachmentField.Size]: {
    max: MAX_FILE_SIZE,
  },
};

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
