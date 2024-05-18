import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../schema/transaction.model';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CurrencyService {
  private readonly apiKey: string;

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('EXCHANGE_API_KEY');
  }

  async convert(amount: number, from: string, to: string, request) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `https://v6.exchangerate-api.com/v6/${this.apiKey}/latest/${from}`,
        ),
      );

      const rate = response.data.conversion_rates[to];
      if (!rate) {
        throw new BadRequestException(`Unable to find exchange rate for ${to}`);
      }

      const convertedAmount = amount * rate;
      const userId = request.user.id;

      await this.logTransaction(userId, amount, from, to, convertedAmount);

      return convertedAmount;
    } catch (error) {
      throw new BadRequestException('Error fetching exchange rate data');
    }
  }

  async logTransaction(
    userId: string,
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    convertedAmount: number,
  ) {
    const transaction = new this.transactionModel({
      userId,
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount,
    });

    return transaction.save();
  }
}
