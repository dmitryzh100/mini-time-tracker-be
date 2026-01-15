import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordApiDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;
}
