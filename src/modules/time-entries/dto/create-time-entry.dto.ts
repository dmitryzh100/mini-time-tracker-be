import { ApiProperty } from '@nestjs/swagger';

export class CreateTimeEntryApiDto {
  @ApiProperty({
    description: 'Date of the time entry',
    example: '2024-01-15',
  })
  date: string;

  @ApiProperty({
    description: 'Number of hours worked',
    example: 8,
    minimum: 0.01,
    maximum: 24,
  })
  hours: number;

  @ApiProperty({
    description: 'Work description',
    example: 'Implemented user authentication feature',
  })
  description: string;

  @ApiProperty({
    description: 'Project ID',
    example: 1,
  })
  projectId: number;
}
