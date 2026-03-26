import { ErrorCategory, ErrorSeverity } from '../value-objects/ErrorClassification';
import { ParsedLine } from './ILogParser';

export interface IErrorClassifier {
  classify(parsedLine: ParsedLine, rawLine: string): ErrorClassificationResult;
}

export interface ErrorClassificationResult {
  category: ErrorCategory;
  severity: ErrorSeverity;
  confidence: number;
  matchedPattern?: string;
}
