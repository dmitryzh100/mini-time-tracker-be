import { Leave, LeaveAttachment } from '@prisma/client';

export interface LeaveWithAttachments extends Leave {
  attachments: LeaveAttachment[];
}

export interface AttachmentData {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}
