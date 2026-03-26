import { LogAnalyzer } from '../../src/infrastructure/services/LogAnalyzer';
import { LogEntry, LogBatch, ErrorCategory, ErrorSeverity } from '../../src/domain';

function createMockLogEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: Math.random().toString(36),
    lineNumber: 1,
    timestamp: new Date(),
    level: 'ERROR',
    message: 'Database connection failed',
    source: 'backend',
    stackTrace: null,
    errorCategory: ErrorCategory.DATABASE,
    errorSeverity: ErrorSeverity.HIGH,
    httpStatus: null,
    transactionId: null,
    userId: null,
    metadata: {},
    previousLines: [],
    nextLines: [],
    ...overrides,
  } as LogEntry;
}

function createMockBatch(overrides: Partial<LogBatch> = {}): LogBatch {
  return {
    id: Math.random().toString(36),
    fileName: 'test.log',
    totalLines: 0,
    totalErrors: 0,
    totalWarnings: 0,
    totalInfo: 0,
    processedLines: 0,
    uploadedAt: new Date(),
    source: 'file',
    ...overrides,
  } as LogBatch;
}

describe('LogAnalyzer', () => {
  let analyzer: LogAnalyzer;

  beforeEach(() => {
    analyzer = new LogAnalyzer();
  });

  describe('analyze', () => {
    it('should analyze log entries correctly', () => {
      const entries = [
        createMockLogEntry({ level: 'ERROR', message: 'Database timeout' }),
        createMockLogEntry({ level: 'ERROR', message: 'Database timeout' }),
        createMockLogEntry({ level: 'WARN', message: 'High memory usage' }),
        createMockLogEntry({ level: 'INFO', message: 'Server started' }),
      ];

      const batch = createMockBatch();

      const result = analyzer.analyze(entries, batch);

      expect(result.totalEntries).toBe(4);
      expect(result.errorEntries.length).toBe(2);
      expect(result.warningEntries.length).toBe(1);
    });

    it('should calculate time range', () => {
      const entries = [
        createMockLogEntry({ timestamp: new Date('2024-01-01T10:00:00Z') }),
        createMockLogEntry({ timestamp: new Date('2024-01-01T12:00:00Z') }),
      ];

      const result = analyzer.analyze(entries, createMockBatch());

      expect(result.timeRange.start).toBeInstanceOf(Date);
      expect(result.timeRange.end).toBeInstanceOf(Date);
    });
  });

  describe('detectPatterns', () => {
    it('should detect repeated error patterns', () => {
      const entries = [
        createMockLogEntry({ message: 'Connection timeout occurred' }),
        createMockLogEntry({ message: 'Connection timeout occurred' }),
        createMockLogEntry({ message: 'Connection timeout occurred' }),
        createMockLogEntry({ message: 'Different error message' }),
      ];

      const patterns = analyzer.detectPatterns(entries);

      expect(patterns.length).toBeGreaterThanOrEqual(1);
      const timeoutPattern = patterns.find(p => p.pattern.includes('timeout'));
      expect(timeoutPattern?.occurrences).toBe(3);
    });

    it('should not create patterns for single occurrences', () => {
      const entries = [
        createMockLogEntry({ message: 'Unique error message 1' }),
        createMockLogEntry({ message: 'Unique error message 2' }),
      ];

      const patterns = analyzer.detectPatterns(entries);

      expect(patterns.length).toBe(0);
    });
  });

  describe('filterEntries', () => {
    it('should filter by date range', () => {
      const entries = [
        createMockLogEntry({ timestamp: new Date('2024-01-01T10:00:00Z') }),
        createMockLogEntry({ timestamp: new Date('2024-01-02T10:00:00Z') }),
        createMockLogEntry({ timestamp: new Date('2024-01-03T10:00:00Z') }),
      ];

      const filtered = analyzer.filterEntries(entries, {
        startDate: new Date('2024-01-02T00:00:00Z'),
        endDate: new Date('2024-01-02T23:59:59Z'),
      });

      expect(filtered.length).toBe(1);
    });

    it('should filter by user ID', () => {
      const entries = [
        createMockLogEntry({ userId: 'user1' }),
        createMockLogEntry({ userId: 'user2' }),
        createMockLogEntry({ userId: 'user1' }),
      ];

      const filtered = analyzer.filterEntries(entries, { userId: 'user1' });

      expect(filtered.length).toBe(2);
    });

    it('should filter by transaction ID', () => {
      const entries = [
        createMockLogEntry({ transactionId: 'tx-001' }),
        createMockLogEntry({ transactionId: 'tx-002' }),
      ];

      const filtered = analyzer.filterEntries(entries, { transactionId: 'tx-001' });

      expect(filtered.length).toBe(1);
    });

    it('should filter by error category', () => {
      const entries = [
        createMockLogEntry({ errorCategory: ErrorCategory.DATABASE }),
        createMockLogEntry({ errorCategory: ErrorCategory.NETWORK }),
        createMockLogEntry({ errorCategory: ErrorCategory.DATABASE }),
      ];

      const filtered = analyzer.filterEntries(entries, {
        errorCategory: ErrorCategory.DATABASE,
      });

      expect(filtered.length).toBe(2);
    });

    it('should filter by severity', () => {
      const entries = [
        createMockLogEntry({ errorSeverity: ErrorSeverity.CRITICAL }),
        createMockLogEntry({ errorSeverity: ErrorSeverity.LOW }),
      ];

      const filtered = analyzer.filterEntries(entries, {
        severity: ErrorSeverity.CRITICAL,
      });

      expect(filtered.length).toBe(1);
    });
  });

  describe('getTopErrors', () => {
    it('should return top N errors sorted by occurrence', () => {
      const entries = [
        createMockLogEntry({ message: 'Error A' }),
        createMockLogEntry({ message: 'Error A' }),
        createMockLogEntry({ message: 'Error A' }),
        createMockLogEntry({ message: 'Error B' }),
        createMockLogEntry({ message: 'Error B' }),
        createMockLogEntry({ message: 'Error C' }),
      ];

      const topErrors = analyzer.getTopErrors(entries, 2);

      expect(topErrors.length).toBe(2);
      expect(topErrors[0].occurrences).toBeGreaterThanOrEqual(topErrors[1].occurrences);
    });
  });

  describe('findRootCauses', () => {
    it('should identify root causes with context', () => {
      const entries = [
        createMockLogEntry({
          message: 'Database timeout',
          previousLines: ['Previous operation'],
          nextLines: ['Retry failed'],
        }),
        createMockLogEntry({
          message: 'Database timeout',
          previousLines: ['Another operation'],
          nextLines: ['Connection lost'],
        }),
      ];

      const patterns = analyzer.detectPatterns(entries);
      const rootCauses = analyzer.findRootCauses(entries, patterns);

      expect(rootCauses.length).toBeGreaterThan(0);
      expect(rootCauses[0].possibleCauses.length).toBeGreaterThan(0);
      expect(rootCauses[0].suggestedFixes.length).toBeGreaterThan(0);
    });
  });
});
