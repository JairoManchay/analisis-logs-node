import { ErrorCategory, ErrorSeverity } from '../../domain';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LogBatchResponseDto {
  id: string;
  fileName: string | null;
  totalLines: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
  processedLines: number;
  uploadedAt: string;
  source: 'file' | 'text';
}

export interface ErrorPatternResponseDto {
  id: string;
  pattern: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  description: string;
  occurrences: number;
  firstSeen: string | null;
  lastSeen: string | null;
  sampleLines: string[];
}

export interface LogEntryResponseDto {
  id: string;
  lineNumber: number;
  timestamp: string | null;
  level: string | null;
  message: string;
  source: string | null;
  errorCategory: ErrorCategory;
  errorSeverity: ErrorSeverity;
  httpStatus: number | null;
  transactionId: string | null;
  userId: string | null;
  previousLines: string[];
  nextLines: string[];
}

export interface AnalysisResultResponseDto {
  id: string;
  batchId: string;
  analyzedAt: string;
  totalEntries: number;
  errorCount: number;
  warningCount: number;
  mostFrequentError: ErrorPatternResponseDto | null;
  topErrors: ErrorPatternResponseDto[];
  httpStatusSummary: Record<string, number>;
  errorByCategory: Record<string, number>;
  timeRange: {
    start: string | null;
    end: string | null;
  };
}

export interface RootCauseResponseDto {
  errorPattern: ErrorPatternResponseDto;
  occurrences: number;
  affectedLines: number;
  context: string[];
  possibleCauses: string[];
  suggestedFixes: string[];
}

export interface FilteredEntriesResponseDto {
  entries: LogEntryResponseDto[];
  pagination: PaginationMeta;
}
