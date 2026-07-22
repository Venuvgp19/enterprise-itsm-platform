import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiRouterService, AiRouterConfig } from './ai-router.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI Router')
@ApiBearerAuth()
@Controller('api/v1/ai-router')
export class AiRouterController {
  constructor(private readonly aiRouterService: AiRouterService) {}

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Get current AI Router configuration (model, threshold)' })
  async getConfig() {
    return this.aiRouterService.getConfig();
  }

  @Public()
  @Patch('config')
  @ApiOperation({ summary: 'Update AI Router settings (modelName, confidence threshold)' })
  async updateConfig(@Body() patch: Partial<AiRouterConfig>) {
    return this.aiRouterService.updateConfig(patch);
  }

  @Public()
  @Post('analyze/:id')
  @ApiOperation({ summary: 'Analyze incident ticket using NVIDIA Nemotron 3 LLM reasoning engine' })
  async analyzeIncident(
    @Param('id') incidentId: string,
    @CurrentUser('tenantId') tenantId?: string
  ) {
    return this.aiRouterService.analyzeIncident(tenantId || 'tenant_acme_01', incidentId);
  }

  @Public()
  @Post('route/:id')
  @ApiOperation({ summary: 'Auto-assign incident ticket to recommended group using AI Router' })
  async routeIncident(
    @Param('id') incidentId: string,
    @CurrentUser('tenantId') tenantId?: string
  ) {
    return this.aiRouterService.routeIncident(tenantId || 'tenant_acme_01', incidentId);
  }

  @Public()
  @Post('scan-unassigned')
  @ApiOperation({ summary: 'Scan main database unassigned queue and auto-assign all unassigned tickets' })
  async scanUnassignedQueue(@CurrentUser('tenantId') tenantId?: string) {
    return this.aiRouterService.scanAndRouteUnassignedQueue(tenantId || 'tenant_acme_01');
  }

  @Public()
  @Get('analytics')
  @ApiOperation({ summary: 'Retrieve live routing accuracy, workload distribution, and confidence audit logs' })
  async getAnalytics() {
    return this.aiRouterService.getAnalytics();
  }
}
