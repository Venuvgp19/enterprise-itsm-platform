import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users & Departments')
@ApiBearerAuth()
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all user accounts in enterprise tenant' })
  async findAllUsers(@CurrentUser('tenantId') tenantId: string) {
    return this.usersService.findAllUsers(tenantId);
  }

  @Get('departments')
  @ApiOperation({ summary: 'List all organizational departments (Unix, Network Ops, SecOps...)' })
  async getDepartments() {
    return this.usersService.getDepartments();
  }

  @Post()
  @ApiOperation({ summary: 'Provision new enterprise user account' })
  async createUser(@Body() dto: any) {
    return this.usersService.createUser(dto);
  }
}
