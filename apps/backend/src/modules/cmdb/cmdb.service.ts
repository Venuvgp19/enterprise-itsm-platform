import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CIStatus } from '@itsm/db';

export class CreateCIDto {
  name: string;
  ciClass: string;
  status?: CIStatus;
  serialNumber?: string;
  ipAddress?: string;
  macAddress?: string;
  location?: string;
  environment?: string;
  attributesJson?: Record<string, any>;
}

export class CreateCIRelationshipDto {
  parentCiId: string;
  childCiId: string;
  relationType: string;
}

@Injectable()
export class CmdbService {
  constructor(private prisma: PrismaService) {}

  async createCI(tenantId: string, dto: CreateCIDto) {
    return this.prisma.configurationItem.create({
      data: {
        tenantId,
        name: dto.name,
        ciClass: dto.ciClass,
        status: dto.status || CIStatus.OPERATIONAL,
        serialNumber: dto.serialNumber,
        ipAddress: dto.ipAddress,
        macAddress: dto.macAddress,
        location: dto.location,
        environment: dto.environment,
        attributesJson: dto.attributesJson,
      },
    });
  }

  async findAllCIs(tenantId: string) {
    return this.prisma.configurationItem.findMany({
      where: { tenantId },
      include: {
        parentRelations: { include: { childCi: true } },
        childRelations: { include: { parentCi: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneCI(tenantId: string, id: string) {
    const ci = await this.prisma.configurationItem.findFirst({
      where: { id, tenantId },
      include: {
        parentRelations: { include: { childCi: true } },
        childRelations: { include: { parentCi: true } },
        incidents: { select: { id: true, number: true, shortDescription: true, state: true } },
      },
    });

    if (!ci) throw new NotFoundException(`Configuration Item ${id} not found`);
    return ci;
  }

  async createRelationship(dto: CreateCIRelationshipDto) {
    return this.prisma.cIRelationship.create({
      data: {
        parentCiId: dto.parentCiId,
        childCiId: dto.childCiId,
        relationType: dto.relationType,
      },
    });
  }
}
