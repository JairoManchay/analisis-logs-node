import { ILogRepository } from '../../domain/interfaces/ILogRepository';
import { LogBatch } from '../../domain';
import { ILogger } from '../../shared/logger/ILogger';

export class GetBatchesUseCase {
  constructor(
    private readonly logRepository: ILogRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<LogBatch[]> {
    this.logger.info('Getting all batches');
    return this.logRepository.getAllBatches();
  }
}
