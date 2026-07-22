import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowService, CreateWorkflowDto } from './workflow.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Workflow Engine')
@ApiBearerAuth()
@Controller('api/v1/workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  @ApiOperation({ summary: 'Save visual workflow definition DAG (nodes & edges)' })
  async createWorkflow(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateWorkflowDto,
  ) {
    return this.workflowService.createWorkflow(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all workflow definitions' })
  async getWorkflows(@CurrentUser('tenantId') tenantId: string) {
    return this.workflowService.getWorkflows(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow definition graph by ID' })
  async getWorkflowById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.workflowService.getWorkflowById(tenantId, id);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Trigger visual workflow execution instance' })
  async executeWorkflow(
    @Param('id') id: string,
    @Body() contextJson: Record<string, any>,
  ) {
    return this.workflowService.executeWorkflow(id, contextJson);
  }
}
