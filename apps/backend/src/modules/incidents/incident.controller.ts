import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IncidentService } from './incident.service';
import { CreateIncidentDto, UpdateIncidentDto, AddActivityDto } from './dto/incident.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Incident Management')
@ApiBearerAuth()
@Controller('api/v1/incidents')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Public()
  @Get('fields/schema')
  @ApiOperation({ summary: 'Retrieve complete Incident entity field dictionary and schema definitions' })
  async getFieldsSchema() {
    return this.incidentService.getFieldsDictionary();
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new incident ticket' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') callerId: string,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.incidentService.create(tenantId || 'demo-tenant-id', callerId || 'monitoring-bot-id', dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all incident tickets for current tenant' })
  async findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.incidentService.findAll(tenantId || 'demo-tenant-id');
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get detailed incident record by ID with all fields' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.incidentService.findOne(tenantId || 'demo-tenant-id', id);
  }

  @Public()
  @Patch(':id')
  @ApiOperation({ summary: 'Update incident state, priority, assignment, or resolution code' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidentService.update(tenantId || 'demo-tenant-id', id, dto);
  }

  @Public()
  @Post(':id/activities')
  @ApiOperation({ summary: 'Add internal Work Note or Customer Comment to incident' })
  async addActivity(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') authorId: string,
    @Param('id') id: string,
    @Body() dto: AddActivityDto,
  ) {
    return this.incidentService.addActivity(tenantId || 'demo-tenant-id', id, authorId || 'admin-user-id', dto);
  }

  @Public()
  @Post(':id/remediate')
  @ApiOperation({ summary: 'Execute Autonomous AI Self-Healing Auto-Remediation Playbook' })
  async remediate(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.incidentService.remediate(tenantId || 'demo-tenant-id', id);
  }
}
