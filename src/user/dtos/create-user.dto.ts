import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'user', description: 'The username of the user' })
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    example: 'password',
    description: 'The password of the user',
    minimum: 6,
  })
  password: string;
}
