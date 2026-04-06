export interface LogEntry {
    lineNumber: number;
    timestamp: string;
    level: 'E' | 'W' | 'I';
    service?: string;
    dni?: string;
    message: string;
    rawLine: string;
    jsonPayload?: Record<string, unknown>;
    requestId?: string;
}
export interface ErrorGroup {
    message: string;
    service: string;
    line: number;
    count: number;
    dnIs: string[];
    errorType: 'http_error' | 'validation_rule' | 'unknown';
    jsonPayloads?: Record<string, unknown>[];
    reasons?: string[];
    endpoint?: string;
    environment?: string;
    errorCode?: string;
    requestId?: string;
    relatedEntries?: string[];
}
export interface LogAnalysisResult {
    mostFrequentError: ErrorGroup;
    errors: ErrorGroup[];
    totalErrors: number;
    totalLines: number;
    analyzedAt: string;
}
export interface ParsedLogFile {
    id: string;
    filename: string;
    entries: LogEntry[];
    errors: LogEntry[];
    analysis?: LogAnalysisResult;
    createdAt: string;
}
//# sourceMappingURL=LogEntry.d.ts.map