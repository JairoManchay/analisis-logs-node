import { IErrorClassifier, ErrorClassificationResult } from '../../domain/interfaces/IErrorClassifier';
import { ParsedLine } from '../../domain/interfaces/ILogParser';
import { ErrorCategory, ErrorSeverity } from '../../domain/value-objects/ErrorClassification';

interface ErrorPatternRule {
  pattern: RegExp;
  category: ErrorCategory;
  severity: ErrorSeverity;
  description: string;
}

export class ErrorClassifier implements IErrorClassifier {
  private readonly rules: ErrorPatternRule[] = [
    {
      pattern: /\bECONNREFUSED|ECONNRESET|ENOTFOUND|ETIMEDOUT|ENETUNREACH\b/i,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      description: 'Network connectivity error',
    },
    {
      pattern: /\bconnection\s*(timed?\s*out|failed|refused)\b/i,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      description: 'Connection timeout or failure',
    },
    {
      pattern: /\bvalidation\s*(error|failed|exception)\b|\binvalid\s*(input|data|parameter)\b/i,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      description: 'Data validation error',
    },
    {
      pattern: /\bUnauthorized|unauthenticated|invalid\s*token|jwt\s*expired\b/i,
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      description: 'Authentication failure',
    },
    {
      pattern: /\bForbidden|Access\s*denied|insufficient\s*permissions|unauthorized\s*access\b/i,
      category: ErrorCategory.AUTHORIZATION,
      severity: ErrorSeverity.HIGH,
      description: 'Authorization failure',
    },
    {
      pattern: /\bnot\s*found|404|ENOENT|does\s*not\s*exist\b/i,
      category: ErrorCategory.NOT_FOUND,
      severity: ErrorSeverity.MEDIUM,
      description: 'Resource not found',
    },
    {
      pattern: /\bbad\s*request|400|malformed|invalid\s*format\b/i,
      category: ErrorCategory.BAD_REQUEST,
      severity: ErrorSeverity.MEDIUM,
      description: 'Bad request error',
    },
    {
      pattern: /\b(sql|mysql|postgres|mongodb|database)\s*(error|exception|timeout|connection)\b/i,
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.HIGH,
      description: 'Database error',
    },
    {
      pattern: /\b500|Internal\s*Server\s*Error|unhandled\s*exception|NullPointerException|RuntimeException\b/i,
      category: ErrorCategory.SERVER,
      severity: ErrorSeverity.CRITICAL,
      description: 'Internal server error',
    },
    {
      pattern: /\b504|gateway\s*timeout|upstream\s*timeout\b/i,
      category: ErrorCategory.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      description: 'Gateway timeout',
    },
    {
      pattern: /\brate\s*limit|429|too\s*many\s*requests|throttl/i,
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.LOW,
      description: 'Rate limit exceeded',
    },
    {
      pattern: /\bOutOfMemoryError|Memory\s*exhausted|heap\s*space\b/i,
      category: ErrorCategory.SERVER,
      severity: ErrorSeverity.CRITICAL,
      description: 'Memory exhaustion error',
    },
  ];

  classify(parsedLine: ParsedLine, rawLine: string): ErrorClassificationResult {
    const combinedText = `${parsedLine.message} ${rawLine}`.toLowerCase();

    if (parsedLine.httpStatus && parsedLine.httpStatus >= 500) {
      return {
        category: ErrorCategory.SERVER,
        severity: ErrorSeverity.CRITICAL,
        confidence: 0.9,
      };
    }

    if (parsedLine.httpStatus && parsedLine.httpStatus >= 400) {
      return {
        category: ErrorCategory.BAD_REQUEST,
        severity: ErrorSeverity.MEDIUM,
        confidence: 0.8,
      };
    }

    for (const rule of this.rules) {
      if (rule.pattern.test(combinedText)) {
        return {
          category: rule.category,
          severity: rule.severity,
          confidence: 0.85,
          matchedPattern: rule.pattern.source,
        };
      }
    }

    const hasStackTrace = parsedLine.stackTrace || 
      /\bat\s+[\w.$<>]+\(.*\)/.test(rawLine);
    
    if (hasStackTrace) {
      return {
        category: ErrorCategory.SERVER,
        severity: ErrorSeverity.MEDIUM,
        confidence: 0.6,
      };
    }

    return {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.LOW,
      confidence: 0.3,
    };
  }

  registerRule(pattern: RegExp, category: ErrorCategory, severity: ErrorSeverity, description: string): void {
    this.rules.push({ pattern, category, severity, description });
  }
}
