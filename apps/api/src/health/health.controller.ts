import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { HealthResponse } from '@dtem-board/shared';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({
    description: 'API health status',
  })
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'dtem-board-api',
      timestamp: new Date().toISOString(),
    };
  }
}
