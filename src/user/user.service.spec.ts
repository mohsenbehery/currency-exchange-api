import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { User } from '../schema/user.model';
import { Transaction } from '../schema/transaction.model';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { SignupDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/signIn.dto';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

class MockUserModel {
  static create = jest.fn();
  static find = jest.fn();
  save = jest.fn();
}

class MockTransactionModel {
  static find = jest.fn();
}

class MockJwtService {
  signAsync = jest.fn();
  decode = jest.fn();
  sign = jest.fn();
}

describe('UserService', () => {
  let service: UserService;
  let userModel: typeof MockUserModel;
  let transactionModel: typeof MockTransactionModel;
  let jwtService: MockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: JwtService, useClass: MockJwtService },
        { provide: getModelToken(User.name), useValue: MockUserModel },
        {
          provide: getModelToken(Transaction.name),
          useValue: MockTransactionModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User.name));
    transactionModel = module.get(getModelToken(Transaction.name));
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should successfully register a new user', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        username: 'mohsen behery',
        password: 'password123',
      };
      const salt = randomBytes(8).toString('hex');
      const hashedPassword = (await scrypt('password123', salt, 32)) as Buffer;
      const savedUser = {
        id: 1,
        ...signupDto,
        password: `${salt}.${hashedPassword.toString('hex')}`,
        save: jest.fn().mockResolvedValue(true),
      };

      userModel.find.mockResolvedValue([]);
      userModel.create.mockResolvedValue(savedUser);

      const result = await service.signUp(signupDto);
      expect(result).toEqual(savedUser);
      expect(userModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' }),
      );
    });

    it('should throw an error if the email is already in use', async () => {
      const signupDto: SignupDto = {
        email: 'existing@example.com',
        username: 'mohsen behery',
        password: 'password123',
      };

      userModel.find.mockResolvedValue([
        {
          id: 1,
          username: 'mohsen behery',
          email: 'existing@example.com',
          password: 'hashedpassword',
        },
      ]);

      await expect(service.signUp(signupDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const signInDto: SignInDto = {
        email: 'existing@example.com',
        password: 'password123',
      };
      const salt = randomBytes(8).toString('hex');
      const hashedPassword = (await scrypt('password123', salt, 32)) as Buffer;
      const user = {
        id: 1,
        username: 'mohsen behery',
        email: 'existing@example.com',
        password: `${salt}.${hashedPassword.toString('hex')}`,
      };

      userModel.find.mockResolvedValue([user]);
      jwtService.signAsync.mockResolvedValue('mockAccessToken');

      const result = await service.signIn(signInDto);
      expect(result).toEqual({ accessToken: 'mockAccessToken' });
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw an error if the email is invalid', async () => {
      const signInDto: SignInDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      userModel.find.mockResolvedValue([]);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw an error if the password is incorrect', async () => {
      const signInDto: SignInDto = {
        email: 'existing@example.com',
        password: 'wrongpassword',
      };
      const salt = randomBytes(8).toString('hex');
      const hashedPassword = (await scrypt('password123', salt, 32)) as Buffer;
      const user = {
        id: 1,
        username: 'mohsen behery',
        email: 'existing@example.com',
        password: `${salt}.${hashedPassword.toString('hex')}`,
      };

      userModel.find.mockResolvedValue([user]);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      jwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      jwtService.sign.mockResolvedValue('mockInvalidatedToken');

      await service.logout('mockToken');
      expect(jwtService.decode).toHaveBeenCalledWith('mockToken');
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });

  describe('getUserTransactions', () => {
    it('should fetch user transactions', async () => {
      const userId = 'someUserId';
      const request = { user: { id: userId } };
      const transactions = [
        { userId, amount: 100 },
        { userId, amount: 200 },
      ];

      transactionModel.find.mockResolvedValue(transactions);

      const result = await service.getUserTransactions(request);
      expect(result).toEqual(transactions);
      expect(transactionModel.find).toHaveBeenCalledWith({ userId });
    });
  });
});
