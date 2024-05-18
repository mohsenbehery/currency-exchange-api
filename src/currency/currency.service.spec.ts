import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from './currency.service';
import { getModelToken } from '@nestjs/mongoose';
import { Transaction } from '../schema/transaction.model';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { BadRequestException } from '@nestjs/common';

class MockTransactionModel {
  static create = jest.fn().mockImplementation((transaction) => transaction);
}

class MockHttpService {
  get = jest.fn();
}

class MockConfigService {
  get = jest.fn().mockReturnValue('test-api-key');
}

describe('CurrencyService', () => {
  let service: CurrencyService;
  let transactionModel: typeof MockTransactionModel;
  let httpService: MockHttpService;
  let configService: MockConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: getModelToken(Transaction.name),
          useValue: MockTransactionModel,
        },
        {
          provide: HttpService,
          useClass: MockHttpService,
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
    transactionModel = module.get<typeof MockTransactionModel>(
      getModelToken(Transaction.name),
    );
    httpService = module.get<MockHttpService>(HttpService);
    configService = module.get<MockConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convert', () => {
    it('should convert currency and log transaction', async () => {
      const amount = 100;
      const fromCurrency = 'USD';
      const toCurrency = 'EUR';
      const request = { user: { id: 'userId' } };

      const mockResponse = {
        data: {
          conversion_rates: {
            EUR: 0.85,
          },
        },
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const logTransactionSpy = jest
        .spyOn(service, 'logTransaction')
        .mockResolvedValue(undefined);

      const convertedAmount = await service.convert(
        amount,
        fromCurrency,
        toCurrency,
        request,
      );

      expect(convertedAmount).toBe(
        amount * mockResponse.data.conversion_rates[toCurrency],
      );

      expect(logTransactionSpy).toHaveBeenCalledWith(
        request.user.id,
        amount,
        fromCurrency,
        toCurrency,
        convertedAmount,
      );
    });

    it('should throw BadRequestException if currency conversion rate is not available', async () => {
      const amount = 100;
      const fromCurrency = 'USD';
      const toCurrency = 'XYZ';
      const request = { user: { id: 'userId' } };

      const mockResponse = {
        data: {
          conversion_rates: {
            EUR: 0.85,
          },
        },
      };

      httpService.get.mockReturnValue(of(mockResponse));

      await expect(
        service.convert(amount, fromCurrency, toCurrency, request),
      ).rejects.toThrow(
        new BadRequestException(`Error fetching exchange rate data`),
      );

      expect(MockTransactionModel.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if an error occurs while fetching exchange rate data', async () => {
      const amount = 100;
      const fromCurrency = 'USD';
      const toCurrency = 'EUR';
      const request = { user: { id: 'userId' } };

      httpService.get.mockReturnValue(
        throwError(() => new Error('Error fetching data')),
      );

      await expect(
        service.convert(amount, fromCurrency, toCurrency, request),
      ).rejects.toThrow(
        new BadRequestException('Error fetching exchange rate data'),
      );

      expect(MockTransactionModel.create).not.toHaveBeenCalled();
    });
  });
});
