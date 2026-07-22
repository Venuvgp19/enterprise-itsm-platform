import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CmdbService, CreateCIDto, CreateCIRelationshipDto } from './cmdb.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('CMDB & Infrastructure')
@ApiBearerAuth()
@Controller('api/v1/cmdb')
export class CmdbController {
  constructor(private readonly cmdbService: CmdbService) {}

  @Post('ci')
  @ApiOperation({ summary: 'Register a Configuration Item (CI)' })
  async createCI(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateCIDto,
  ) {
    return this.cmdbService.createCI(tenantId, dto);
  }

  @Get('ci')
  @ApiOperation({ summary: 'List all Configuration Items (CIs)' })
  async findAllCIs(@CurrentUser('tenantId') tenantId: string) {
    return this.cmdbService.findAllCIs(tenantId);
  }

  @Get('ci/:id')
  @ApiOperation({ summary: 'Get Configuration Item topology and details by ID' })
  async findOneCI(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.cmdbService.findOneCI(tenantId, id);
  }

  @Post('relationships')
  @ApiOperation({ summary: 'Link two CIs with a dependency relationship (e.g. Runs On, Depends On)' })
  async createRelationship(@Body() dto: CreateCIRelationshipDto) {
    return this.cmdbService.createRelationship(dto);
  }
}
