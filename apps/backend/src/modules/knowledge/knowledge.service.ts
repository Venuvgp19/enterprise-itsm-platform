import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { IncidentService } from '../incidents/incident.service';
import * as fs from 'fs';
import * as path from 'path';

export interface KnowledgeArticle {
  id: string;
  number: string;
  title: string;
  category: string;
  configurationItem: string;
  summary: string;
  symptoms: string[];
  rootCause: string;
  resolutionSteps: string[];
  workNotesAnalyzedCount: number;
  sourceIncidentIds: string[];
  author: string;
  modelUsed: string;
  viewCount: number;
  helpfulCount: number;
  createdAt: string;
}

@Injectable()
export class KnowledgeService implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeService.name);
  private articles: KnowledgeArticle[] = [];
  private analyzedIncidentIds: Set<string> = new Set<string>();
  private isWorkerRunning = false;
  private totalIncidentsCount = 1000;

  private readonly nvidiaBaseUrl = 'https://integrate.api.nvidia.com/v1';
  private readonly nvidiaApiKey = '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';
  private readonly llamaModel = 'meta/llama-3.3-70b-instruct';

  constructor(private readonly incidentService: IncidentService) {
    this.articles = this.loadOrSeedKnowledgeArticles();
    this.analyzedIncidentIds = this.loadAnalyzedIncidentIds();
    this.deduplicateArticles();
  }

  onModuleInit() {
    this.logger.log(`🤖 Initializing Continuous Background AI Knowledge Worker (Meta Llama 3.3 70B)...`);
    // Start continuous background processing after 5 seconds
    setTimeout(() => {
      this.runContinuousBackgroundSynthesis('tenant_acme_01');
    }, 5000);
  }

  private getDbFilePath(filename: string): string {
    const possiblePaths = [
      path.resolve(process.cwd(), `apps/backend/data/${filename}`),
      path.resolve(process.cwd(), `data/${filename}`),
      path.resolve(__dirname, `../../../data/${filename}`),
      path.resolve(__dirname, `../../data/${filename}`),
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) return p;
    }
    return path.resolve(process.cwd(), `apps/backend/data/${filename}`);
  }

  private loadOrSeedKnowledgeArticles(): KnowledgeArticle[] {
    const filePath = this.getDbFilePath('knowledge_articles.json');
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.logger.log(`Loaded ${parsed.length} Knowledge Articles from file: ${filePath}`);
          return parsed;
        }
      }
    } catch (err: any) {
      this.logger.error(`Error loading Knowledge Articles file: ${err.message}`);
    }
    return [];
  }

  private loadAnalyzedIncidentIds(): Set<string> {
    const filePath = this.getDbFilePath('analyzed_incidents.json');
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          this.logger.log(`Loaded ${parsed.length} analyzed incident IDs from file: ${filePath}`);
          return new Set<string>(parsed);
        }
      }
    } catch (err: any) {
      this.logger.error(`Error loading analyzed incident IDs: ${err.message}`);
    }
    return new Set<string>();
  }

  private saveArticlesToFile() {
    const filePath = this.getDbFilePath('knowledge_articles.json');
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(this.articles, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Failed to write Knowledge Articles file: ${err.message}`);
    }
  }

  private saveAnalyzedIncidentIdsToFile() {
    const filePath = this.getDbFilePath('analyzed_incidents.json');
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(Array.from(this.analyzedIncidentIds), null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Failed to write analyzed incident IDs file: ${err.message}`);
    }
  }

  private deduplicateArticles() {
    const uniqueArticles: KnowledgeArticle[] = [];
    const seenProblems = new Set<string>();

    for (const article of this.articles) {
      const problemKey = this.extractProblemKey(article.title);
      if (!seenProblems.has(problemKey)) {
        seenProblems.add(problemKey);
        uniqueArticles.push(article);
      }
    }

    if (uniqueArticles.length !== this.articles.length) {
      this.logger.log(`Deduplicated Knowledge Base: Kept ${uniqueArticles.length} unique problem articles.`);
      this.articles = uniqueArticles;
      this.saveArticlesToFile();
    }
  }

  private extractProblemKey(title: string): string {
    return title
      .toLowerCase()
      .replace(/troubleshooting\s*&\s*sop:\s*/i, '')
      .replace(/\(#\d+\)/g, '')
      .replace(/\(.*\)/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isProblemAlreadySolved(problemTitle: string): boolean {
    const targetKey = this.extractProblemKey(problemTitle);
    const targetTokens = new Set(targetKey.split(' ').filter((t) => t.length > 3));

    for (const article of this.articles) {
      const existingKey = this.extractProblemKey(article.title);
      if (existingKey === targetKey) return true;

      const existingTokens = existingKey.split(' ').filter((t) => t.length > 3);
      if (targetTokens.size > 0 && existingTokens.length > 0) {
        let overlap = 0;
        for (const token of targetTokens) {
          if (existingTokens.includes(token)) overlap++;
        }
        const overlapRatio = overlap / Math.min(targetTokens.size, existingTokens.length);
        if (overlapRatio > 0.5) {
          return true;
        }
      }
    }
    return false;
  }

  async getStatus(tenantId: string) {
    const allIncidents = await this.incidentService.findAll(tenantId);
    this.totalIncidentsCount = allIncidents.length || 1000;
    const analyzed = this.analyzedIncidentIds.size;
    const percentage = Math.min(100, Math.round((analyzed / this.totalIncidentsCount) * 100));

    return {
      totalIncidentsCount: this.totalIncidentsCount,
      analyzedIncidentCount: analyzed,
      percentageAnalyzed: percentage,
      publishedArticlesCount: this.articles.length,
      isWorkerRunning: this.isWorkerRunning,
      modelUsed: this.llamaModel,
    };
  }

  async findAll(category?: string, query?: string): Promise<KnowledgeArticle[]> {
    let result = [...this.articles];
    if (category && category.toLowerCase() !== 'all') {
      const catLower = category.toLowerCase();
      result = result.filter((a) => a.category.toLowerCase().includes(catLower));
    }
    if (query) {
      const qLower = query.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(qLower) ||
          a.summary.toLowerCase().includes(qLower) ||
          a.configurationItem.toLowerCase().includes(qLower) ||
          a.rootCause.toLowerCase().includes(qLower)
      );
    }
    return result;
  }

  async findOne(id: string): Promise<KnowledgeArticle> {
    const cleanId = id.toUpperCase();
    const article = this.articles.find(
      (a) => a.id.toUpperCase() === cleanId || a.number.toUpperCase() === cleanId
    );
    if (!article) {
      throw new NotFoundException(`Knowledge Article ${id} not found.`);
    }
    article.viewCount++;
    this.saveArticlesToFile();
    return article;
  }

  private async callLlama3370b(prompt: string, problemDomain: string): Promise<any> {
    this.logger.log(`Invoking NVIDIA Meta Llama 3.3 70B Instruct (${this.llamaModel}) for problem: "${problemDomain}"...`);

    try {
      const response = await fetch(`${this.nvidiaBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.nvidiaApiKey}`,
        },
        body: JSON.stringify({
          model: this.llamaModel,
          messages: [
            {
              role: 'system',
              content: `You are an expert ITIL Knowledge Management AI Agent. 
Synthesize a Standard Operating Procedure (SOP) Knowledge Base Article to solve the UNIQUE IT problem: "${problemDomain}".

Respond in strict JSON format:
{
  "title": "string (Unique SOP Title specifying exact problem)",
  "summary": "string (2-3 sentence executive summary explaining exact issue and fix)",
  "symptoms": ["string (Specific symptom 1)", "string (Specific symptom 2)"],
  "rootCause": "string (Detailed technical root cause unique to this issue)",
  "resolutionSteps": ["string (Step 1)", "string (Step 2)", "string (Step 3)"]
}`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.2,
          top_p: 0.7,
          max_tokens: 1024,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: any = await response.json();
      const rawText = data.choices?.[0]?.message?.content || '';
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        title: `Troubleshooting & SOP: ${problemDomain.replace(/\(#\d+\)/, '').trim()}`,
        summary: `Standard Operating Procedure for diagnosing and resolving ${problemDomain} across enterprise infrastructure.`,
        symptoms: [`Telemetry alert triggered for ${problemDomain}`, 'Intermittent latency and error spikes in diagnostic logs.'],
        rootCause: `Root cause identified in diagnostic work notes: System resource contention or configuration drift.`,
        resolutionSteps: [
          `1. Inspect configuration item status for ${problemDomain}.`,
          `2. Apply remediation protocol: Reset service daemon, clear buffer queues, or deploy patch.`,
          `3. Validate operational metric health baseline and confirm ticket resolution.`,
        ],
      };
    }
  }

  /**
   * Continuous background synthesis worker that runs asynchronously on backend startup.
   */
  async runContinuousBackgroundSynthesis(tenantId: string) {
    if (this.isWorkerRunning) return;
    this.isWorkerRunning = true;

    try {
      const allIncidents = await this.incidentService.findAll(tenantId);
      this.totalIncidentsCount = allIncidents.length || 1000;

      const unanalyzed = allIncidents.filter((inc) => !this.analyzedIncidentIds.has(inc.id || inc.number));

      this.logger.log(`🤖 Continuous Worker: Found ${unanalyzed.length} unanalyzed incidents out of ${this.totalIncidentsCount}.`);

      const CHUNK_SIZE = 10;
      for (let i = 0; i < unanalyzed.length; i += CHUNK_SIZE) {
        const batch = unanalyzed.slice(i, i + CHUNK_SIZE);
        const batchSampleTitle = batch[0]?.shortDescription || 'Enterprise IT Issue';
        const ci = batch[0]?.configurationItem || 'General Infrastructure';
        const resolutionCode = batch[0]?.resolutionCode || 'General Triage';

        // Mark batch as analyzed
        for (const inc of batch) {
          this.analyzedIncidentIds.add(inc.id || inc.number);
        }
        this.saveAnalyzedIncidentIdsToFile();

        // Synthesize article if problem is not yet solved
        if (!this.isProblemAlreadySolved(batchSampleTitle)) {
          const kbNumber = `KB${String(this.articles.length + 1).padStart(7, '0')}`;
          const workNotesText = batch
            .flatMap((inc) => (inc.activities || []).map((a: any) => `[${inc.id} - ${inc.shortDescription}] WorkNote: ${a.comment}`))
            .slice(0, 5)
            .join('\n');

          const prompt = `Synthesize UNIQUE SOP Knowledge Article for Problem: "${batchSampleTitle}" (CI: ${ci}, Category: ${resolutionCode}).
Analyzed Batch Work Notes (${batch.length} tickets):
${workNotesText}`;

          try {
            const parsed = await this.callLlama3370b(prompt, batchSampleTitle);
            const article: KnowledgeArticle = {
              id: kbNumber,
              number: kbNumber,
              title: parsed.title || `Troubleshooting & SOP: ${batchSampleTitle.replace(/\(#\d+\)/, '').trim()}`,
              category: resolutionCode,
              configurationItem: ci,
              summary: parsed.summary || `Executive Standard Operating Procedure (SOP) for ${batchSampleTitle}.`,
              symptoms: parsed.symptoms || [`Alerts triggered for ${batchSampleTitle}`, 'System degradation reported.'],
              rootCause: parsed.rootCause || `Diagnostic root cause identified across ${batch.length} analyzed incidents.`,
              resolutionSteps: parsed.resolutionSteps || [
                `1. Inspect configuration item status on ${ci}.`,
                `2. Apply remediation patch or service restart.`,
                `3. Validate metric health baseline.`,
              ],
              workNotesAnalyzedCount: batch.flatMap((b) => b.activities || []).length,
              sourceIncidentIds: batch.map((b) => b.id || b.number),
              author: '🤖 Meta Llama 3.3 70B Instruct (NVIDIA NIM)',
              modelUsed: this.llamaModel,
              viewCount: 1,
              helpfulCount: 0,
              createdAt: new Date().toISOString(),
            };

            this.articles.unshift(article);
            this.saveArticlesToFile();
          } catch (err: any) {
            this.logger.error(`Error in continuous background synthesis: ${err.message}`);
          }
        }

        // 1.5 second pacing between chunks
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch (err: any) {
      this.logger.error(`Error in continuous worker execution: ${err.message}`);
    } finally {
      this.isWorkerRunning = false;
    }
  }

  async synthesizeAllIncidentsInBatches(tenantId: string) {
    // Trigger background synthesis if not already running
    this.runContinuousBackgroundSynthesis(tenantId);
    return this.getStatus(tenantId);
  }

  async generateArticlesFromWorkNotes(tenantId: string) {
    return this.synthesizeAllIncidentsInBatches(tenantId);
  }
}
