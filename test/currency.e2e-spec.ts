import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CurrencyModule } from '../src/currency/currency.module';
import { UserModule } from '../src/user/user.module';
import { AuthGuard } from '../src/user/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import {
  Transaction,
  TransactionSchema,
} from '../src/schema/transaction.model';

describe('CurrencyController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot('mongodb://localhost/nest-test'),
        MongooseModule.forFeature([
          { name: Transaction.name, schema: TransactionSchema },
        ]),
        CurrencyModule,
        UserModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test_secret',
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn((context) => {
              const req = context.switchToHttp().getRequest();
              req.user = { id: 'userId' };
              return true;
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => {
              return of({
                data: {
                  conversion_rates: {
                    SAR: 3.75,
                  },
                },
              });
            }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/convert (POST)', async () => {
    await request(app.getHttpServer()).post('/user/register').send({
      email: 'user@example.com',
      username: 'user',
      password: 'password',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/user/login')
      .send({
        email: 'user@example.com',
        password: 'password',
      });

    const accessToken = loginResponse.body.accessToken;

    const amount = 100;
    const to = 3.75; // SAR exchange rate
    const expectedConvertedAmount = amount * to;

    const response = await request(app.getHttpServer())
      .post('/convert')
      .send({
        amount: amount,
        from: 'USD',
        to: 'SAR',
      })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(response.body).toHaveProperty('convertedAmount');
    expect(response.body.convertedAmount).toBeCloseTo(
      expectedConvertedAmount,
      2,
    );
  });
});
