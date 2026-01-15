import { AttachmentField, LeaveField } from '../enums';

export const leaveFieldNames: Record<LeaveField, string> = {
  [LeaveField.Type]: 'Leave type',
  [LeaveField.StartDate]: 'Start date',
  [LeaveField.EndDate]: 'End date',
  [LeaveField.Reason]: 'Reason',
};

export const attachmentFieldNames: Record<AttachmentField, string> = {
  [AttachmentField.File]: 'File',
  [AttachmentField.Filename]: 'Filename',
  [AttachmentField.MimeType]: 'File type',
  [AttachmentField.Size]: 'File size',
};
