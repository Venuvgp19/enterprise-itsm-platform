import { Module } from '@nestjs/common';
import { IncidentModule } from '../incidents/incident.module';
import { AiRouterController } from './ai-router.controller';
import { AiRouterService } from './ai-router.service';
import { LlmService } from './llm.service';

@Module({
  imports: [IncidentModule],
  controllers: [AiRouterController],
  providers: [AiRouterService, LlmService],
  exports: [AiRouterService, LlmService],
})
export class AiRouterModule {}
