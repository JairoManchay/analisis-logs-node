import { ILogRepository } from '../../domain/interfaces/ILogRepository';
import { ILogAnalyzer, FilterCriteria } from '../../domain/interfaces/ILogAnalyzer';
import { LogEntry } from '../../domain';
import { PaginationMeta } from '../dtos/ResponseDto';
import { ILogger } from '../../shared/logger/ILogger';

export interface FilteredEntriesResult {
  entries: LogEntry[];
  pagination: PaginationMeta;
  total: number;
}

export class FilterEntriesUseCase {
  constructor(
    private readonly logRepository: ILogRepository,
    private readonly logAnalyzer: ILogAnalyzer,
    private readonly logger: ILogger
  ) {}

  async execute(
    batchId: string,
    page: number = 1,
    limit: number = 50,
    startDate?: string,
    endDate?: string,
    userId?: string,
    transactionId?: string,
    errorCategory?: string,
    severity?: string
  ): Promise<FilteredEntriesResult> {
    this.logger.info(`Filtering entries for batch: ${batchId}`, {
      page,
      limit,
      startDate,
      endDate,
    });

    const criteria: FilterCriteria = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      userId,
      transactionId,
      errorCategory,
      severity,
    };

    const allEntries = await this.logRepository.getEntriesByBatchId(batchId);
    const filteredEntries = this.logAnalyzer.filterEntries(allEntries, criteria);

    const total = filteredEntries.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedEntries = filteredEntries.slice(offset, offset + limit);

    return {
      entries: paginatedEntries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      total,
    };
  }
}
