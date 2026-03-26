import { LogEntry } from '../entities/LogEntry';
import { LogBatch } from '../entities/LogBatch';
import { AnalysisResult } from '../entities/AnalysisResult';
import { FilterCriteria } from './ILogAnalyzer';

export interface ILogRepository {
  saveBatch(batch: LogBatch): Promise<LogBatch>;
  saveEntries(entries: LogEntry[]): Promise<LogEntry[]>;
  saveAnalysisResult(result: AnalysisResult): Promise<AnalysisResult>;

  getBatchById(batchId: string): Promise<LogBatch | null>;
  getEntriesByBatchId(batchId: string): Promise<LogEntry[]>;
  getAnalysisResultByBatchId(batchId: string): Promise<AnalysisResult | null>;

  filterEntries(criteria: FilterCriteria): Promise<LogEntry[]>;
  getAllBatches(): Promise<LogBatch[]>;

  deleteBatch(batchId: string): Promise<boolean>;
  deleteEntriesByBatchId(batchId: string): Promise<boolean>;
}
