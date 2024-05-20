import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { AuthGuard } from '../user/auth.guard';
import { ConvertDto } from './dtos/create-conversion.dto';

@ApiTags('currency')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('currency')
export class CurrencyController {
  constructor(private currencyService: CurrencyService) {}

  @Post('convert')
  @ApiBody({ type: ConvertDto })
  @ApiResponse({
    status: 201,
    description: 'The converted amount',
    schema: { example: { convertedAmount: 85 } },
  })
  @ApiBearerAuth()
  async convert(@Body() convertDto: ConvertDto, @Request() request: Request) {
    const { amount, from, to } = convertDto;
    const convertedAmount = await this.currencyService.convert(
      amount,
      from,
      to,
      request,
    );
    return { convertedAmount };
  }
}
