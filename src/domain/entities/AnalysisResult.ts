import { LogBatch } from './LogBatch';
import { ErrorPattern } from './ErrorPattern';
import { LogEntry } from './LogEntry';

export interface AnalysisResult {
  id: string;
  batchId: string;
  batch: LogBatch;
  analyzedAt: Date;
  totalEntries: number;
  errorEntries: LogEntry[];
  warningEntries: LogEntry[];
  patterns: ErrorPattern[];
  mostFrequentError: ErrorPattern | null;
  topErrors: ErrorPattern[];
  httpStatusSummary: Record<number, number>;
  errorByCategory: Record<string, number>;
  timeRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface RootCauseAnalysis {
  errorPattern: ErrorPattern;
  occurrences: number;
  affectedLines: number;
  context: string[];
  possibleCauses: string[];
  suggestedFixes: string[];
}
