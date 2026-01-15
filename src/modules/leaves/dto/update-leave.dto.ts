import { ApiProperty } from '@nestjs/swagger';
import { LeaveType } from '@prisma/client';

export class UpdateLeaveApiDto {
  @ApiProperty({
    description: 'Type of leave',
    enum: LeaveType,
    example: LeaveType.DAY_OFF,
    required: false,
  })
  type?: LeaveType;

  @ApiProperty({
    description: 'Start date of leave',
    example: '2024-01-15',
    required: false,
  })
  startDate?: string;

  @ApiProperty({
    description: 'End date of leave',
    example: '2024-01-16',
    required: false,
  })
  endDate?: string;

  @ApiProperty({
    description: 'Reason for leave',
    example: 'Personal matters',
    required: false,
  })
  reason?: string | null;
}
