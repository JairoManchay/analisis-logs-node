import { ErrorCategory, ErrorSeverity } from '../value-objects/ErrorClassification';

export interface LogEntry {
  id: string;
  lineNumber: number;
  timestamp: Date | null;
  level: string | null;
  message: string;
  source: string | null;
  stackTrace: string | null;
  errorCategory: ErrorCategory;
  errorSeverity: ErrorSeverity;
  httpStatus: number | null;
  transactionId: string | null;
  userId: string | null;
  metadata: Record<string, unknown>;
  previousLines: string[];
  nextLines: string[];
}

export interface LogEntryCreateParams {
  lineNumber: number;
  rawLine: string;
  timestamp?: Date | null;
  level?: string | null;
  message?: string;
  source?: string | null;
  stackTrace?: string | null;
  httpStatus?: number | null;
  transactionId?: string | null;
  userId?: string | null;
  metadata?: Record<string, unknown>;
  previousLines?: string[];
  nextLines?: string[];
}

export class LogEntryEntity implements LogEntry {
  id: string;
  lineNumber: number;
  timestamp: Date | null;
  level: string | null;
  message: string;
  source: string | null;
  stackTrace: string | null;
  errorCategory: ErrorCategory;
  errorSeverity: ErrorSeverity;
  httpStatus: number | null;
  transactionId: string | null;
  userId: string | null;
  metadata: Record<string, unknown>;
  previousLines: string[];
  nextLines: string[];

  constructor(
    id: string,
    params: LogEntryCreateParams,
    classification: { category: ErrorCategory; severity: ErrorSeverity }
  ) {
    this.id = id;
    this.lineNumber = params.lineNumber;
    this.timestamp = params.timestamp ?? null;
    this.level = params.level ?? null;
    this.message = params.message ?? params.rawLine;
    this.source = params.source ?? null;
    this.stackTrace = params.stackTrace ?? null;
    this.errorCategory = classification.category;
    this.errorSeverity = classification.severity;
    this.httpStatus = params.httpStatus ?? null;
    this.transactionId = params.transactionId ?? null;
    this.userId = params.userId ?? null;
    this.metadata = { ...(params.metadata || {}), batchId: (params.metadata as Record<string, unknown>)?.batchId };
    this.previousLines = params.previousLines ?? [];
    this.nextLines = params.nextLines ?? [];
  }

  isError(): boolean {
    return this.level !== null && ['ERROR', 'ERR', 'FATAL', 'CRITICAL'].includes(this.level.toUpperCase());
  }

  isWarning(): boolean {
    return this.level !== null && ['WARN', 'WARNING'].includes(this.level.toUpperCase());
  }

  getFormattedTimestamp(): string | null {
    if (!this.timestamp) return null;
    return this.timestamp.toISOString();
  }

  toSummary(): string {
    return `[${this.getFormattedTimestamp() || 'N/A'}] ${this.level || 'UNKNOWN'}: ${this.message.substring(0, 100)}`;
  }
}
