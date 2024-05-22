import {
  Body,
  Controller,
  Headers,
  Post,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Serialize } from '../interceptors/serializeInterceptor';
import { SignupDto } from './dtos/create-user.dto';
import { SignInDto } from './dtos/signIn.dto';
import { SignUpResDto } from './dtos/create-user.res';
import { SignInResDto } from './dtos/singIn.res';
import { AuthGuard } from './auth.guard';
import { TransactionResDto } from '../currency/dtos/transaction-res.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private usersService: UserService) {}
  @Serialize(SignUpResDto)
  @Post('/register')
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        _id: 'someId',
        username: 'ExampleName',
        email: 'Example@mm.com',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiOperation({ summary: 'Create User' })
  async signUp(@Body() user: SignupDto) {
    return await this.usersService.signUp(user);
  }
  @Serialize(SignInResDto)
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged in',
    schema: { example: { token: '<JWT_token>' } },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post('/login')
  @ApiOperation({ summary: 'Login' })
  async signIn(@Body() data: SignInDto) {
    return await this.usersService.signIn(data);
  }
  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, schema: { example: 'Logout successful' } })
  @UseGuards(AuthGuard)
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Bearer token is missing');
    }

    await this.usersService.logout(token);
    return { message: 'Logout successful' };
  }
  @Serialize(TransactionResDto)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @Get('history')
  @ApiResponse({
    status: 200,
    description: 'Get user transactions',
    schema: {
      example: [
        {
          _id: 'someId',
          userId: 'someId',
          amount: 1000,
          fromCurrency: 'USD',
          toCurrency: 'EGP',
          convertedAmount: 46905.5,
          date: '2024-05-19T07:02:54.133Z',
        },
      ],
    },
  })
  @ApiOperation({ summary: "get User transactions'history" })
  async getUserTransactions(@Request() request: Request) {
    return await this.usersService.getUserTransactions(request);
  }
}
