import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { IncidentModule } from '../incidents/incident.module';
import { AiRouterModule } from '../ai-router/ai-router.module';

@Module({
  imports: [IncidentModule, AiRouterModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
