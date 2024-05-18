import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { CreateConversionDto } from './dtos/create-conversion.dto';
import { AuthGuard } from '../user/auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

const mockAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'userId' };
    return true;
  }),
};

const mockCurrencyService = {
  convert: jest.fn(),
};

describe('CurrencyController', () => {
  let controller: CurrencyController;
  let service: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencyController],
      providers: [
        {
          provide: CurrencyService,
          useValue: mockCurrencyService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<CurrencyController>(CurrencyController);
    service = module.get<CurrencyService>(CurrencyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('convert', () => {
    it('should convert currency and return converted amount', async () => {
      const createConversionDto: CreateConversionDto = {
        amount: 100,
        from: 'USD',
        to: 'EUR',
      };
      const request = { user: { id: 'userId' } };
      const convertedAmount = 85; // Mocked converted amount

      jest.spyOn(service, 'convert').mockResolvedValue(convertedAmount);

      const result = await controller.convert(createConversionDto, request);

      expect(result).toEqual({ convertedAmount });
      expect(service.convert).toHaveBeenCalledWith(
        createConversionDto.amount,
        createConversionDto.from,
        createConversionDto.to,
        request,
      );
    });
  });
});
