import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConvertDto {
  @ApiProperty({ example: 100, description: 'The amount to be converted' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'USD', description: 'The currency to convert from' })
  @IsString()
  from: string;

  @ApiProperty({ example: 'EUR', description: 'The currency to convert to' })
  @IsString()
  to: string;
}
