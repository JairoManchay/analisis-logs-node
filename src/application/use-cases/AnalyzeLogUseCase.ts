import { ILogRepository } from '../../domain/interfaces/ILogRepository';
import { ILogAnalyzer } from '../../domain/interfaces/ILogAnalyzer';
import { AnalysisResult, LogBatch, ErrorPattern, RootCauseAnalysis } from '../../domain';
import { v4 as uuidv4 } from 'uuid';
import { ILogger } from '../../shared/logger/ILogger';

export class AnalyzeLogUseCase {
  constructor(
    private readonly logRepository: ILogRepository,
    private readonly logAnalyzer: ILogAnalyzer,
    private readonly logger: ILogger
  ) {}

  async execute(batchId: string): Promise<AnalysisResult> {
    this.logger.info(`Starting analysis for batch: ${batchId}`);

    const batch = await this.logRepository.getBatchById(batchId);
    if (!batch) {
      throw new Error(`Batch not found: ${batchId}`);
    }

    const existingResult = await this.logRepository.getAnalysisResultByBatchId(batchId);
    if (existingResult) {
      this.logger.info(`Returning cached analysis for batch: ${batchId}`);
      return existingResult;
    }

    const entries = await this.logRepository.getEntriesByBatchId(batchId);

    const result = this.logAnalyzer.analyze(entries, batch);

    const savedResult = await this.logRepository.saveAnalysisResult(result);

    this.logger.info(`Analysis complete for batch: ${batchId}`, {
      totalEntries: result.totalEntries,
      errorCount: result.errorEntries.length,
      patternCount: result.patterns.length,
    });

    return savedResult;
  }
}
