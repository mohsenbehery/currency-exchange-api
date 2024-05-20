import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'HomePage' })
  @ApiResponse({ status: 200, schema: { example: 'Hello World!' } })
  getHello(): string {
    return this.appService.getHello();
  }
}
