import { ErrorCategory, ErrorSeverity } from '../value-objects/ErrorClassification';

export interface ErrorPattern {
  id: string;
  pattern: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  description: string;
  occurrences: number;
  firstSeen: Date | null;
  lastSeen: Date | null;
  sampleLines: string[];
}

export interface ErrorPatternCreateParams {
  id: string;
  pattern: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  description: string;
  occurrences?: number;
  firstSeen?: Date | null;
  lastSeen?: Date | null;
  sampleLines?: string[];
}
