import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpStatusCode } from '@common/constants';
import { Public } from '@modules/auth/decorators/public.decorator';
import { AppService } from './app.service';

export interface HealthResponse {
  status: string;
  timestamp: string;
}

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: HttpStatusCode.OK, description: 'Service is healthy' })
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }
}
