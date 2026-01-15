import { Messages } from '@common/constants';

const ENTITY = 'Leave request';
const ATTACHMENT_ENTITY = 'Attachment';

export const LeaveMessages = {
  created: (): string => Messages.created(ENTITY),

  updated: (): string => Messages.updated(ENTITY),

  deleted: (): string => Messages.deleted(ENTITY),

  notFound: (id: number): string => Messages.notFound(ENTITY, id),

  notOwner: (): string => Messages.notOwner('leave requests'),

  attachmentDeleted: (): string => Messages.deleted(ATTACHMENT_ENTITY),

  attachmentNotFound: (): string => Messages.notFound(ATTACHMENT_ENTITY),

  fileRequired: (): string => Messages.fileRequired(),

  invalidFileType: (allowed: string): string =>
    Messages.invalidFileType(allowed),

  fileTooLarge: (maxSize: string): string => Messages.fileTooLarge(maxSize),

  tooManyFiles: (max: number): string => Messages.tooManyFiles(max),

  invalidDateRange: (): string =>
    'End date must be after or equal to start date',

  overlappingLeave: (): string =>
    'You already have a leave request for this date range',

  attachmentRequired: (): string =>
    'Sick leave requires at least one attachment',
} as const;
