import { ApiProperty } from '@nestjs/swagger';
import { LeaveType } from '@prisma/client';

export class CreateLeaveApiDto {
  @ApiProperty({
    description: 'Type of leave',
    enum: LeaveType,
    example: LeaveType.SICK_LEAVE,
  })
  type: LeaveType;

  @ApiProperty({
    description: 'Start date of leave',
    example: '2024-01-15',
  })
  startDate: string;

  @ApiProperty({
    description: 'End date of leave',
    example: '2024-01-16',
  })
  endDate: string;

  @ApiProperty({
    description: 'Reason for leave',
    example: 'Medical appointment',
    required: false,
  })
  reason?: string;
}
