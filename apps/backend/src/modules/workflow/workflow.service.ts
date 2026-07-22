import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ExecutionStatus } from '@itsm/db';

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  nodesJson: any;
  edgesJson: any;
}

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  async createWorkflow(tenantId: string, dto: CreateWorkflowDto) {
    return this.prisma.workflowDefinition.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        nodesJson: dto.nodesJson,
        edgesJson: dto.edgesJson,
      },
    });
  }

  async getWorkflows(tenantId: string) {
    return this.prisma.workflowDefinition.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getWorkflowById(tenantId: string, id: string) {
    const wf = await this.prisma.workflowDefinition.findFirst({
      where: { id, tenantId },
    });
    if (!wf) throw new NotFoundException(`Workflow ${id} not found`);
    return wf;
  }

  async executeWorkflow(workflowId: string, contextJson: Record<string, any>) {
    const workflow = await this.prisma.workflowDefinition.findUnique({
      where: { id: workflowId },
    });
    if (!workflow) throw new NotFoundException(`Workflow ${workflowId} not found`);

    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        status: ExecutionStatus.RUNNING,
        contextJson,
      },
    });

    const nodes = workflow.nodesJson as any[];
    const startNode = nodes.find((n) => n.type === 'start') || nodes[0];

    const logs: string[] = [`Workflow execution started at node: ${startNode ? startNode.id : 'N/A'}`];

    await this.prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: ExecutionStatus.COMPLETED,
        completedAt: new Date(),
        contextJson: {
          ...contextJson,
          executionLogs: logs,
        },
      },
    });

    return {
      executionId: execution.id,
      status: ExecutionStatus.COMPLETED,
      logs,
    };
  }
}
