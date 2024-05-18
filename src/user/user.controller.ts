import {
  Body,
  Controller,
  Headers,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Serialize } from '../interceptors/serializeInterceptor';
import { SignupDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/signIn.dto';
import { SignUpResDto } from './dtos/create-user.res';
import { SignInResDto } from './dtos/singIn.res';
import { AuthGuard } from './auth.guard';
import { TransactionResDto } from '../currency/dtos/transaction-res.dto';

@Controller('user')
export class UserController {
  constructor(private usersService: UserService) {}
  @Serialize(SignUpResDto)
  @Post('/register')
  async signUp(@Body() user: SignupDto) {
    return await this.usersService.signUp(user);
  }
  @Serialize(SignInResDto)
  @Post('/login')
  async signIn(@Body() data: SignInDto) {
    return await this.usersService.signIn(data);
  }
  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader.split(' ')[1];
    await this.usersService.logout(token);
    return { message: 'Logout successful' };
  }
  @Serialize(TransactionResDto)
  @UseGuards(AuthGuard)
  @Get('history')
  async getUserTransactions(@Request() request: Request) {
    return await this.usersService.getUserTransactions(request);
  }
}
