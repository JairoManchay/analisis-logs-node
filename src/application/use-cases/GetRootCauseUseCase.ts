import { ILogRepository } from '../../domain/interfaces/ILogRepository';
import { ILogAnalyzer } from '../../domain/interfaces/ILogAnalyzer';
import { RootCauseAnalysis } from '../../domain';
import { ILogger } from '../../shared/logger/ILogger';

export class GetRootCauseUseCase {
  constructor(
    private readonly logRepository: ILogRepository,
    private readonly logAnalyzer: ILogAnalyzer,
    private readonly logger: ILogger
  ) {}

  async execute(batchId: string, patternId?: string): Promise<RootCauseAnalysis[]> {
    this.logger.info(`Analyzing root causes for batch: ${batchId}`);

    const entries = await this.logRepository.getEntriesByBatchId(batchId);
    
    const errorEntries = entries.filter(e => 
      e.level && ['ERROR', 'ERR', 'FATAL', 'CRITICAL'].includes(e.level.toUpperCase())
    );

    const patterns = this.logAnalyzer.detectPatterns(errorEntries);

    const rootCauses = this.logAnalyzer.findRootCauses(errorEntries, patterns);

    if (patternId) {
      return rootCauses.filter(rc => rc.errorPattern.id === patternId);
    }

    return rootCauses;
  }
}
