import { ApiProperty } from '@nestjs/swagger';

export class SignInApiDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123',
  })
  password: string;
}
