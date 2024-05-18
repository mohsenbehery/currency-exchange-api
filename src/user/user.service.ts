import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.model';
import { SignupDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/signIn.dto';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';
import { Transaction } from '../schema/transaction.model';

const scrypt = promisify(_scrypt);

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private jwtService: JwtService,
  ) {}

  async createUser(user: SignupDto) {
    let newUser = await this.userModel.create(user);
    await newUser.save();
    return newUser;
  }
  async findUser(email: string) {
    const user = await this.userModel.find({ email });
    return user;
  }

  async signUp(user: SignupDto) {
    const oldUser = await this.findUser(user.email);
    if (oldUser.length) {
      throw new BadRequestException('Email is already in use');
    }
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(user.password, salt, 32)) as Buffer;
    const result = `${salt}.${hash.toString('hex')}`;

    user.password = result;
    const newUser = await this.createUser(user);
    return newUser;
  }

  async signIn(data: SignInDto) {
    const user = await this.findUser(data.email);
    if (!user.length) {
      throw new BadRequestException('Invalid email');
    }
    const [salt, hash] = user[0].password.split('.');
    const newHash = (await scrypt(data.password, salt, 32)) as Buffer;
    if (newHash.toString('hex') !== hash) {
      throw new BadRequestException('Invalid password');
    }
    const payload = {
      id: user[0]._id,
      username: user[0].username,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
  async logout(token: string) {
    const { exp } = this.jwtService.decode(token);
    const invalidatedToken = this.jwtService.sign(
      {},
      { expiresIn: exp - Math.floor(Date.now() / 1000) },
    );
  }
  async getUserTransactions(request) {
    const userId = request['user'].id;
    return await this.transactionModel.find({ userId });
  }
}
