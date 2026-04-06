import { ErrorGroup, LogEntry, LogAnalysisResult } from '../../domain/entities';
export declare class LogAnalyzerService {
    private readonly REAL_ERROR_PATTERNS;
    private readonly HTTP_ERROR_PATTERNS;
    private readonly IGNORE_TAGS;
    analyze(entries: LogEntry[]): LogAnalysisResult;
    private isRealError;
    private getErrorType;
    private extractEndpoint;
    private extractEnvironment;
    private extractErrorCode;
    private extractReason;
    filterByDNI(errors: ErrorGroup[], dni: string): ErrorGroup[];
    filterByService(errors: ErrorGroup[], service: string): ErrorGroup[];
    filterByRequestId(errors: ErrorGroup[], requestId: string): ErrorGroup[];
    private groupErrors;
    private generateKey;
    private sortByCount;
    private createEmptyErrorGroup;
    filterByEndpoint(errors: ErrorGroup[], endpoint: string): ErrorGroup[];
    filterByEnvironment(errors: ErrorGroup[], environment: string): ErrorGroup[];
}
//# sourceMappingURL=LogAnalyzerService.d.ts.map