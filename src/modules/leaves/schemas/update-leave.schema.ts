import { LeaveType } from '@prisma/client';
import { z } from 'zod';
import { FieldNames, Messages, Validation } from '@common/constants';
import { LeaveMessages } from '../constants';
import { LeaveField } from '../enums';

const rules = {
  reason: Validation.leave(LeaveField.Reason),
};

const fields = {
  type: FieldNames.leave(LeaveField.Type),
  startDate: FieldNames.leave(LeaveField.StartDate),
  endDate: FieldNames.leave(LeaveField.EndDate),
  reason: FieldNames.leave(LeaveField.Reason),
};

export const updateLeaveSchema = z
  .object({
    type: z
      .enum(LeaveType, {
        error: Messages.invalid(fields.type),
      })
      .optional(),
    startDate: z.iso
      .date({ error: Messages.date(fields.startDate) })
      .optional(),
    endDate: z.iso.date({ error: Messages.date(fields.endDate) }).optional(),
    reason: z
      .string()
      .max(rules.reason.maxLength!, {
        error: Messages.maxLength(fields.reason, rules.reason.maxLength!),
      })
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }

      return true;
    },
    {
      message: LeaveMessages.invalidDateRange(),
      path: ['endDate'],
    },
  );

export type UpdateLeaveDto = z.infer<typeof updateLeaveSchema>;
