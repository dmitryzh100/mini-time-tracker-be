import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordApiDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'abc123-def456-...',
  })
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewPassword123',
  })
  password: string;
}
