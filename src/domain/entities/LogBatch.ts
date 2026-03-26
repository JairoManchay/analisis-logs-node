export interface LogBatch {
  id: string;
  fileName: string | null;
  totalLines: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
  processedLines: number;
  uploadedAt: Date;
  source: 'file' | 'text';
}

export interface LogBatchCreateParams {
  id: string;
  fileName?: string | null;
  totalLines: number;
  totalErrors?: number;
  totalWarnings?: number;
  totalInfo?: number;
  processedLines?: number;
  uploadedAt?: Date;
  source?: 'file' | 'text';
}

export class LogBatchEntity implements LogBatch {
  id: string;
  fileName: string | null;
  totalLines: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
  processedLines: number;
  uploadedAt: Date;
  source: 'file' | 'text';

  constructor(params: LogBatchCreateParams) {
    this.id = params.id;
    this.fileName = params.fileName ?? null;
    this.totalLines = params.totalLines;
    this.totalErrors = params.totalErrors ?? 0;
    this.totalWarnings = params.totalWarnings ?? 0;
    this.totalInfo = params.totalInfo ?? 0;
    this.processedLines = params.processedLines ?? 0;
    this.uploadedAt = params.uploadedAt ?? new Date();
    this.source = params.source ?? 'file';
  }

  getErrorRate(): number {
    if (this.totalLines === 0) return 0;
    return (this.totalErrors / this.totalLines) * 100;
  }

  getWarningRate(): number {
    if (this.totalLines === 0) return 0;
    return (this.totalWarnings / this.totalLines) * 100;
  }
}
