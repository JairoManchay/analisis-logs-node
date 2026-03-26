import { LogEntry } from '../entities/LogEntry';
import { ErrorPattern } from '../entities/ErrorPattern';
import { AnalysisResult } from '../entities/AnalysisResult';
import { RootCauseAnalysis } from '../entities/AnalysisResult';
import { LogBatch } from '../entities/LogBatch';

export interface FilterCriteria {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  transactionId?: string;
  errorCategory?: string;
  severity?: string;
}

export interface ILogAnalyzer {
  analyze(entries: LogEntry[], batch: LogBatch): AnalysisResult;
  detectPatterns(entries: LogEntry[]): ErrorPattern[];
  findRootCauses(entries: LogEntry[], patterns: ErrorPattern[]): RootCauseAnalysis[];
  filterEntries(entries: LogEntry[], criteria: FilterCriteria): LogEntry[];
  getTopErrors(entries: LogEntry[], n: number): ErrorPattern[];
}
