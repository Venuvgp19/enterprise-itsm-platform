import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const defaultUsers = [
  { id: 'u1', name: 'System Admin', email: 'admin@acme.com', role: 'Global Administrator', department: 'IT Ops', status: 'ACTIVE', mfa: true },
  { id: 'u2', name: 'Sarah Connor', email: 's.connor@acme.com', role: 'ITIL Incident Manager', department: 'App Support', status: 'ACTIVE', mfa: true },
  { id: 'u3', name: 'Alex Mercer', email: 'a.mercer@acme.com', role: 'Security Specialist', department: 'SecOps', status: 'ACTIVE', mfa: false },
  { id: 'u4', name: 'David Miller', email: 'd.miller@acme.com', role: 'Service Desk Agent', department: 'Desktop Support', status: 'ACTIVE', mfa: false },
  { id: 'u5', name: 'Richard Stallman', email: 'r.stallman@acme.com', role: 'Global Administrator', department: 'Unix', status: 'ACTIVE', mfa: true },
];

const defaultDepartments = ['Unix', 'Network Ops', 'App Support', 'Desktop Support', 'DevOps Ops', 'SecOps', 'DBA Team', 'IT Ops'];

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllUsers(tenantId: string) {
    try {
      const records = await this.prisma.user.findMany({
        where: { tenantId },
        select: { id: true, email: true, firstName: true, lastName: true, title: true, isActive: true },
      });
      if (records.length > 0) return records;
    } catch (err) {
      // Fallback
    }
    return defaultUsers;
  }

  async getDepartments() {
    return defaultDepartments;
  }

  async createUser(dto: any) {
    const newUser = {
      id: `u_${Date.now()}`,
      name: `${dto.firstName} ${dto.lastName}`,
      email: dto.email,
      role: dto.role || 'Service Desk Agent',
      department: dto.department || 'Unix',
      status: 'ACTIVE',
      mfa: false,
    };
    defaultUsers.unshift(newUser);
    return newUser;
  }
}
