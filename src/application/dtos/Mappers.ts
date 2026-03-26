import { LogBatch, LogEntry, ErrorPattern, AnalysisResult, RootCauseAnalysis } from '../../domain';
import {
  LogBatchResponseDto,
  ErrorPatternResponseDto,
  LogEntryResponseDto,
  AnalysisResultResponseDto,
  RootCauseResponseDto,
} from './ResponseDto';
import dayjs from 'dayjs';

export class LogBatchMapper {
  static toDto(batch: LogBatch): LogBatchResponseDto {
    return {
      id: batch.id,
      fileName: batch.fileName,
      totalLines: batch.totalLines,
      totalErrors: batch.totalErrors,
      totalWarnings: batch.totalWarnings,
      totalInfo: batch.totalInfo,
      processedLines: batch.processedLines,
      uploadedAt: dayjs(batch.uploadedAt).toISOString(),
      source: batch.source,
    };
  }
}

export class ErrorPatternMapper {
  static toDto(pattern: ErrorPattern): ErrorPatternResponseDto {
    return {
      id: pattern.id,
      pattern: pattern.pattern,
      category: pattern.category,
      severity: pattern.severity,
      description: pattern.description,
      occurrences: pattern.occurrences,
      firstSeen: pattern.firstSeen ? dayjs(pattern.firstSeen).toISOString() : null,
      lastSeen: pattern.lastSeen ? dayjs(pattern.lastSeen).toISOString() : null,
      sampleLines: pattern.sampleLines,
    };
  }
}

export class LogEntryMapper {
  static toDto(entry: LogEntry): LogEntryResponseDto {
    return {
      id: entry.id,
      lineNumber: entry.lineNumber,
      timestamp: entry.timestamp ? dayjs(entry.timestamp).toISOString() : null,
      level: entry.level,
      message: entry.message,
      source: entry.source,
      errorCategory: entry.errorCategory,
      errorSeverity: entry.errorSeverity,
      httpStatus: entry.httpStatus,
      transactionId: entry.transactionId,
      userId: entry.userId,
      previousLines: entry.previousLines,
      nextLines: entry.nextLines,
    };
  }
}

export class AnalysisResultMapper {
  static toDto(result: AnalysisResult): AnalysisResultResponseDto {
    return {
      id: result.id,
      batchId: result.batchId,
      analyzedAt: dayjs(result.analyzedAt).toISOString(),
      totalEntries: result.totalEntries,
      errorCount: result.errorEntries.length,
      warningCount: result.warningEntries.length,
      mostFrequentError: result.mostFrequentError
        ? ErrorPatternMapper.toDto(result.mostFrequentError)
        : null,
      topErrors: result.topErrors.map(ErrorPatternMapper.toDto),
      httpStatusSummary: Object.fromEntries(
        Object.entries(result.httpStatusSummary).map(([k, v]) => [String(k), v])
      ),
      errorByCategory: result.errorByCategory,
      timeRange: {
        start: result.timeRange.start ? dayjs(result.timeRange.start).toISOString() : null,
        end: result.timeRange.end ? dayjs(result.timeRange.end).toISOString() : null,
      },
    };
  }
}

export class RootCauseMapper {
  static toDto(analysis: RootCauseAnalysis): RootCauseResponseDto {
    return {
      errorPattern: ErrorPatternMapper.toDto(analysis.errorPattern),
      occurrences: analysis.occurrences,
      affectedLines: analysis.affectedLines,
      context: analysis.context,
      possibleCauses: analysis.possibleCauses,
      suggestedFixes: analysis.suggestedFixes,
    };
  }
}
