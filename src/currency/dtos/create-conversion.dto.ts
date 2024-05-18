import { IsNumber, IsString } from 'class-validator';

export class CreateConversionDto {
  @IsNumber()
  amount: number;

  @IsString()
  from: string;

  @IsString()
  to: string;
}
