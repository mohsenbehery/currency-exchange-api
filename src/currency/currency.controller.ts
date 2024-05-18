import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateConversionDto } from './dtos/create-conversion.dto';
import { AuthGuard } from '../user/auth.guard';

@Controller('convert')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @UseGuards(AuthGuard)
  @Post()
  async convert(
    @Body() createConversionDto: CreateConversionDto,
    @Request() request,
  ) {
    const { amount, from, to } = createConversionDto;
    const convertedAmount = await this.currencyService.convert(
      amount,
      from,
      to,
      request,
    );
    return { convertedAmount };
  }
}
