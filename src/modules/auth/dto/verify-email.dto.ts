import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailApiDto {
  @ApiProperty({
    description: 'Email verification token',
    example: 'abc123-def456-...',
  })
  token: string;
}
