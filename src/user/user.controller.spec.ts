import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SignupDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/signIn.dto';
import { SignUpResDto } from './dtos/create-user.res';
import { SignInResDto } from './dtos/singIn.res';
import { TransactionResDto } from '../currency/dtos/transaction-res.dto';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

const mockUserService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  logout: jest.fn(),
  getUserTransactions: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true), // Mock the behavior of your guard
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        JwtService,
        ConfigService,
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should successfully register a new user', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        username: 'mohsen behery',
        password: 'password123',
      };
      const result: SignUpResDto = {
        _id: 'someId',
        email: 'test@example.com',
        username: 'mohsen behery',
      };

      service.signUp.mockResolvedValue(result as any);

      expect(await controller.signUp(signupDto)).toEqual(result);
      expect(service.signUp).toHaveBeenCalledWith(signupDto);
    });

    it('should throw an error if the email is already in use', async () => {
      const signupDto: SignupDto = {
        email: 'existing@example.com',
        username: 'mohsen behery',
        password: 'password123',
      };

      service.signUp.mockRejectedValue(
        new BadRequestException('Email is already in use'),
      );

      await expect(controller.signUp(signupDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.signUp).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result: SignInResDto = { accessToken: 'mockAccessToken' };

      service.signIn.mockResolvedValue(result as any);

      expect(await controller.signIn(signInDto)).toEqual(result);
      expect(service.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('should throw an error if the email or password is incorrect', async () => {
      const signInDto: SignInDto = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      service.signIn.mockRejectedValue(
        new BadRequestException('Invalid credentials'),
      );

      await expect(controller.signIn(signInDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      const authHeader = 'Bearer mockToken';

      await controller.logout(authHeader);

      expect(service.logout).toHaveBeenCalledWith('mockToken');
      expect(await controller.logout(authHeader)).toEqual({
        message: 'Logout successful',
      });
    });
  });

  describe('getUserTransactions', () => {
    it('should fetch user transactions', async () => {
      const request = {
        user: { id: 'someUserId' },
        headers: {},
        method: '',
        url: '',
      } as unknown as Request;
      const transactions: TransactionResDto[] = [
        {
          _id: '1',
          userId: 'someUserId',
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          amount: 100,
          convertedAmount: 85,
          date: new Date(),
        },
        {
          _id: '2',
          userId: 'someUserId',
          fromCurrency: 'USD',
          toCurrency: 'GBP',
          amount: 200,
          convertedAmount: 150,
          date: new Date(),
        },
      ];

      service.getUserTransactions.mockResolvedValue(transactions as any);

      expect(await controller.getUserTransactions(request as any)).toEqual(
        transactions,
      );
      expect(service.getUserTransactions).toHaveBeenCalledWith(request);
    });
  });
});
