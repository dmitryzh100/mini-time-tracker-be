import { ApiProperty } from '@nestjs/swagger';

export class UpdateTimeEntryApiDto {
  @ApiProperty({
    description: 'Date of the time entry',
    example: '2024-01-15',
    required: false,
  })
  date?: string;

  @ApiProperty({
    description: 'Number of hours worked',
    example: 8,
    minimum: 0.01,
    maximum: 24,
    required: false,
  })
  hours?: number;

  @ApiProperty({
    description: 'Work description',
    example: 'Implemented user authentication feature',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Project ID',
    example: 1,
    required: false,
  })
  projectId?: number;
}
