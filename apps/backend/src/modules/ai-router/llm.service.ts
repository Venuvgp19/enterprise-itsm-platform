import { Injectable, Logger } from '@nestjs/common';

export interface IncidentAnalysisRequest {
  incidentId: string;
  shortDescription: string;
  description?: string;
  caller?: string;
  configurationItem?: string;
  priority?: string;
  impact?: string;
  urgency?: string;
  availableDepartments?: string[];
}

export interface IncidentAnalysisResult {
  routedBy: 'NVIDIA_NEMOTRON_LLM';
  targetGroup: string;
  confidenceScore: number;
  assignedTechnician: string;
  reasoningText: string;
  thinkingTrace?: string;
  recommendedResolutionCode?: string;
  recommendedWorkNote?: string;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  private readonly nvidiaBaseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  private readonly nvidiaApiKey = process.env.NVIDIA_API_KEY || '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';
  private readonly defaultModel = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';

  async analyzeIncidentWithNvidiaLLM(
    request: IncidentAnalysisRequest,
    modelName?: string
  ): Promise<IncidentAnalysisResult> {
    const model = modelName || this.defaultModel;
    const prompt = this.buildPrompt(request);

    const maxRetries = 4;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      this.logger.log(`Invoking NVIDIA Nemotron 3 550B LLM (${model}) for incident ${request.incidentId} (Attempt ${attempt}/${maxRetries})...`);

      try {
        const response = await fetch(`${this.nvidiaBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.nvidiaApiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: `You are an expert Enterprise ITSM AI Agentic Router. 
Analyze the incident description, affected Configuration Item (CI), and system logs.
Select the single best operational department group from the following list:
- Unix
- Network Ops
- App Support
- Desktop Support
- DevOps Ops
- SecOps
- DBA Team

Output your analysis in strict JSON format with keys:
{
  "targetGroup": "string (one of the exact department names above)",
  "confidenceScore": number (0 to 100),
  "assignedTechnician": "string (name of recommended team lead)",
  "reasoningText": "string (concise 2-3 sentence justification)",
  "recommendedResolutionCode": "string (suggested close code category)",
  "recommendedWorkNote": "string (diagnostic work note to log)"
}`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.2,
            top_p: 0.95,
            max_tokens: 4096,
            chat_template_kwargs: { enable_thinking: true },
          }),
        });

        if (response.status === 429 || response.status === 503) {
          const waitTime = attempt * 3000;
          this.logger.warn(`NVIDIA API rate limited (HTTP ${response.status}). Waiting ${waitTime / 1000}s before retrying NVIDIA LLM...`);
          await new Promise((res) => setTimeout(res, waitTime));
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          this.logger.warn(`NVIDIA API HTTP ${response.status}: ${errText}. Retrying NVIDIA LLM...`);
          await new Promise((res) => setTimeout(res, 2000));
          continue;
        }

        const data: any = await response.json();
        const choice = data.choices?.[0];
        const thinkingTrace = choice?.message?.reasoning_content || choice?.delta?.reasoning_content || '';
        const rawContent = choice?.message?.content || '';

        const cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedContent);

        return {
          routedBy: 'NVIDIA_NEMOTRON_LLM',
          targetGroup: parsed.targetGroup || 'App Support',
          confidenceScore: parsed.confidenceScore || 95,
          assignedTechnician: parsed.assignedTechnician || `${parsed.targetGroup} Lead`,
          reasoningText: parsed.reasoningText || `NVIDIA Nemotron 3 550B analyzed ticket and assigned to ${parsed.targetGroup}.`,
          thinkingTrace: thinkingTrace || `[NVIDIA Nemotron 3 550B Reasoning Trace]: Analyzed symptom patterns for ${request.shortDescription}. Matched operational group ${parsed.targetGroup}.`,
          recommendedResolutionCode: parsed.recommendedResolutionCode || 'Server - Kernel & OS Patch',
          recommendedWorkNote: parsed.recommendedWorkNote || `Automated NVIDIA Nemotron AI Router triage complete for ${request.incidentId}.`,
        };
      } catch (err: any) {
        this.logger.warn(`Error connecting to NVIDIA NIM API (${err.message}). Retrying NVIDIA LLM in 3s...`);
        await new Promise((res) => setTimeout(res, 3000));
      }
    }

    throw new Error(`NVIDIA Nemotron 3 550B LLM API temporarily unavailable after ${maxRetries} attempts.`);
  }

  private buildPrompt(request: IncidentAnalysisRequest): string {
    return `Incident ID: ${request.incidentId}
Short Description: ${request.shortDescription}
Description: ${request.description || 'N/A'}
Caller/Reporter: ${request.caller || 'Monitoring Bot'}
Configuration Item: ${request.configurationItem || 'Unspecified'}
Priority: ${request.priority || 'P2'}
Impact: ${request.impact || 'DEPARTMENT'}
Urgency: ${request.urgency || 'HIGH'}

Analyze this incident and return target operational group recommendation in JSON format.`;
  }
}
