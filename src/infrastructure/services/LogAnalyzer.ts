import { ILogAnalyzer, FilterCriteria } from '../../domain/interfaces/ILogAnalyzer';
import {
  LogEntry,
  LogBatch,
  ErrorPattern,
  AnalysisResult,
  RootCauseAnalysis,
} from '../../domain';
import { v4 as uuidv4 } from 'uuid';
import { ErrorCategory, ErrorSeverity } from '../../domain/value-objects/ErrorClassification';

export class LogAnalyzer implements ILogAnalyzer {
  private readonly patternThreshold = 2;

  analyze(entries: LogEntry[], batch: LogBatch): AnalysisResult {
    const errorEntries = entries.filter(e =>
      e.level && ['ERROR', 'ERR', 'FATAL', 'CRITICAL'].includes(e.level.toUpperCase())
    );

    const warningEntries = entries.filter(e =>
      e.level && ['WARN', 'WARNING'].includes(e.level.toUpperCase())
    );

    const patterns = this.detectPatterns(errorEntries);
    const topErrors = this.getTopErrors(errorEntries, 10);

    const timestamps = entries
      .filter(e => e.timestamp)
      .map(e => e.timestamp!.getTime());

    const timeRange = {
      start: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
      end: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null,
    };

    const httpStatusSummary: Record<number, number> = {};
    const errorByCategory: Record<string, number> = {};

    for (const entry of errorEntries) {
      if (entry.httpStatus) {
        httpStatusSummary[entry.httpStatus] = (httpStatusSummary[entry.httpStatus] || 0) + 1;
      }
      errorByCategory[entry.errorCategory] = (errorByCategory[entry.errorCategory] || 0) + 1;
    }

    return {
      id: uuidv4(),
      batchId: batch.id,
      batch,
      analyzedAt: new Date(),
      totalEntries: entries.length,
      errorEntries,
      warningEntries,
      patterns,
      mostFrequentError: topErrors[0] || null,
      topErrors,
      httpStatusSummary,
      errorByCategory,
      timeRange,
    };
  }

  detectPatterns(entries: LogEntry[]): ErrorPattern[] {
    const patternMap = new Map<string, {
      messages: string[];
      lineNumbers: number[];
      timestamps: Date[];
      firstSeen: Date | null;
      lastSeen: Date | null;
    }>();

    for (const entry of entries) {
      const normalizedMessage = this.normalizeMessage(entry.message);
      const patternKey = this.extractPatternKey(normalizedMessage);

      if (!patternMap.has(patternKey)) {
        patternMap.set(patternKey, {
          messages: [],
          lineNumbers: [],
          timestamps: [],
          firstSeen: null,
          lastSeen: null,
        });
      }

      const patternData = patternMap.get(patternKey)!;
      patternData.messages.push(entry.message);
      patternData.lineNumbers.push(entry.lineNumber);
      
      if (entry.timestamp) {
        patternData.timestamps.push(entry.timestamp);
        if (!patternData.firstSeen || entry.timestamp < patternData.firstSeen) {
          patternData.firstSeen = entry.timestamp;
        }
        if (!patternData.lastSeen || entry.timestamp > patternData.lastSeen) {
          patternData.lastSeen = entry.timestamp;
        }
      }
    }

    const patterns: ErrorPattern[] = [];

    for (const [patternKey, data] of patternMap) {
      if (data.messages.length >= this.patternThreshold) {
        const category = this.inferCategory(patternKey);
        const severity = this.inferSeverity(data.messages.length);

        patterns.push({
          id: uuidv4(),
          pattern: patternKey,
          category: category.category,
          severity: category.severity,
          description: this.generateDescription(patternKey, data.messages.length),
          occurrences: data.messages.length,
          firstSeen: data.firstSeen,
          lastSeen: data.lastSeen,
          sampleLines: data.messages.slice(0, 3),
        });
      }
    }

    return patterns.sort((a, b) => b.occurrences - a.occurrences);
  }

  findRootCauses(entries: LogEntry[], patterns: ErrorPattern[]): RootCauseAnalysis[] {
    const rootCauses: RootCauseAnalysis[] = [];

    for (const pattern of patterns) {
      const affectedEntries = entries.filter(e => 
        this.normalizeMessage(e.message).includes(pattern.pattern)
      );

      const context: string[] = [];
      for (const entry of affectedEntries.slice(0, 5)) {
        context.push(...entry.previousLines, entry.message, ...entry.nextLines);
      }

      rootCauses.push({
        errorPattern: pattern,
        occurrences: pattern.occurrences,
        affectedLines: affectedEntries.length,
        context: [...new Set(context)].slice(0, 20),
        possibleCauses: this.generatePossibleCauses(pattern),
        suggestedFixes: this.generateSuggestedFixes(pattern),
      });
    }

    return rootCauses.sort((a, b) => b.occurrences - a.occurrences);
  }

  filterEntries(entries: LogEntry[], criteria: FilterCriteria): LogEntry[] {
    let filtered = [...entries];

    if (criteria.startDate) {
      filtered = filtered.filter(e =>
        e.timestamp && e.timestamp >= criteria.startDate!
      );
    }

    if (criteria.endDate) {
      filtered = filtered.filter(e =>
        e.timestamp && e.timestamp <= criteria.endDate!
      );
    }

    if (criteria.userId) {
      filtered = filtered.filter(e =>
        e.userId && e.userId.toLowerCase().includes(criteria.userId!.toLowerCase())
      );
    }

    if (criteria.transactionId) {
      filtered = filtered.filter(e =>
        e.transactionId && e.transactionId.toLowerCase().includes(criteria.transactionId!.toLowerCase())
      );
    }

    if (criteria.errorCategory) {
      filtered = filtered.filter(e =>
        e.errorCategory.toLowerCase() === criteria.errorCategory!.toLowerCase()
      );
    }

    if (criteria.severity) {
      filtered = filtered.filter(e =>
        e.errorSeverity.toLowerCase() === criteria.severity!.toLowerCase()
      );
    }

    return filtered;
  }

  getTopErrors(entries: LogEntry[], n: number): ErrorPattern[] {
    const patterns = this.detectPatterns(entries);
    return patterns.slice(0, n);
  }

  private normalizeMessage(message: string): string {
    return message
      .replace(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[.\d]*Z?/g, '<TIMESTAMP>')
      .replace(/\b[\w-]{36}\b/g, '<UUID>')
      .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, '<IP>')
      .replace(/\b\d+\b/g, '<NUM>')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private extractPatternKey(normalizedMessage: string): string {
    const words = normalizedMessage.split(' ').filter(w => w.length > 3);
    return words.slice(0, 8).join(' ');
  }

  private inferCategory(patternKey: string): { category: ErrorCategory; severity: ErrorSeverity } {
    const lowerPattern = patternKey.toLowerCase();

    if (/network|connection|timeout|socket/i.test(lowerPattern)) {
      return { category: ErrorCategory.NETWORK, severity: ErrorSeverity.HIGH };
    }
    if (/validation|invalid|schema/i.test(lowerPattern)) {
      return { category: ErrorCategory.VALIDATION, severity: ErrorSeverity.MEDIUM };
    }
    if (/database|sql|mongo|query/i.test(lowerPattern)) {
      return { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH };
    }
    if (/auth|token|jwt|login/i.test(lowerPattern)) {
      return { category: ErrorCategory.AUTHENTICATION, severity: ErrorSeverity.HIGH };
    }
    if (/permission|access|forbidden/i.test(lowerPattern)) {
      return { category: ErrorCategory.AUTHORIZATION, severity: ErrorSeverity.HIGH };
    }
    if (/500|exception|null|fatal|crash/i.test(lowerPattern)) {
      return { category: ErrorCategory.SERVER, severity: ErrorSeverity.CRITICAL };
    }

    return { category: ErrorCategory.UNKNOWN, severity: ErrorSeverity.MEDIUM };
  }

  private inferSeverity(occurrences: number): ErrorSeverity {
    if (occurrences >= 10) return ErrorSeverity.CRITICAL;
    if (occurrences >= 5) return ErrorSeverity.HIGH;
    if (occurrences >= 2) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  private generateDescription(patternKey: string, occurrences: number): string {
    const shortPattern = patternKey.length > 50 
      ? patternKey.substring(0, 47) + '...' 
      : patternKey;
    return `Pattern "${shortPattern}" occurred ${occurrences} times`;
  }

  private generatePossibleCauses(pattern: ErrorPattern): string[] {
    const causes: string[] = [];
    const lowerPattern = pattern.pattern.toLowerCase();

    if (pattern.category === ErrorCategory.NETWORK) {
      causes.push('Network connectivity issue between services');
      causes.push('Firewall or proxy blocking requests');
      causes.push('Service temporarily unavailable');
    } else if (pattern.category === ErrorCategory.DATABASE) {
      causes.push('Database connection pool exhausted');
      causes.push('Slow query or missing index');
      causes.push('Database server temporarily unreachable');
    } else if (pattern.category === ErrorCategory.VALIDATION) {
      causes.push('Invalid input data format');
      causes.push('Missing required fields');
      causes.push('Business rule violation');
    } else if (pattern.category === ErrorCategory.SERVER) {
      causes.push('Unhandled exception in application code');
      causes.push('Resource exhaustion (memory, disk)');
      causes.push('Third-party service dependency failure');
    }

    if (pattern.severity === ErrorSeverity.CRITICAL) {
      causes.push('System stability may be at risk');
      causes.push('Immediate attention required');
    }

    return [...new Set(causes)];
  }

  private generateSuggestedFixes(pattern: ErrorPattern): string[] {
    const fixes: string[] = [];
    const lowerPattern = pattern.pattern.toLowerCase();

    if (pattern.category === ErrorCategory.NETWORK) {
      fixes.push('Implement retry logic with exponential backoff');
      fixes.push('Add circuit breaker pattern');
      fixes.push('Configure appropriate timeouts');
    } else if (pattern.category === ErrorCategory.DATABASE) {
      fixes.push('Optimize database queries');
      fixes.push('Add missing database indexes');
      fixes.push('Review connection pool settings');
    } else if (pattern.category === ErrorCategory.VALIDATION) {
      fixes.push('Add input sanitization');
      fixes.push('Implement proper error messages');
      fixes.push('Add request validation middleware');
    } else if (pattern.category === ErrorCategory.SERVER) {
      fixes.push('Add global error handling');
      fixes.push('Implement proper logging');
      fixes.push('Review error handling in affected modules');
    }

    fixes.push(`Monitor this pattern for ${pattern.occurrences} occurrences`);

    return fixes;
  }
}
