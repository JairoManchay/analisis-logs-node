import { InMemoryLogRepository } from '../../src/infrastructure/repositories/InMemoryLogRepository';
import { LogBatch, LogEntry, ErrorCategory, ErrorSeverity } from '../../src/domain';

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

function createMockEntry(batchId: string, overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: Math.random().toString(36),
    lineNumber: 1,
    timestamp: new Date(),
    level: 'ERROR',
    message: 'Test error',
    source: 'backend',
    stackTrace: null,
    errorCategory: ErrorCategory.DATABASE,
    errorSeverity: ErrorSeverity.HIGH,
    httpStatus: null,
    transactionId: null,
    userId: null,
    metadata: { batchId },
    previousLines: [],
    nextLines: [],
    ...overrides,
  } as LogEntry;
}

describe('InMemoryLogRepository', () => {
  let repository: InMemoryLogRepository;

  beforeEach(() => {
    repository = new InMemoryLogRepository();
  });

  describe('saveBatch', () => {
    it('should save a batch', async () => {
      const batch = createMockBatch();
      const saved = await repository.saveBatch(batch);

      expect(saved.id).toBe(batch.id);
    });
  });

  describe('saveEntries', () => {
    it('should save entries to a batch', async () => {
      const batch = createMockBatch();
      await repository.saveBatch(batch);

      const entries = [
        createMockEntry(batch.id),
        createMockEntry(batch.id),
      ];

      const saved = await repository.saveEntries(entries);

      expect(saved.length).toBe(2);
    });

    it('should return empty array for empty input', async () => {
      const saved = await repository.saveEntries([]);
      expect(saved.length).toBe(0);
    });
  });

  describe('getBatchById', () => {
    it('should retrieve a batch by ID', async () => {
      const batch = createMockBatch();
      await repository.saveBatch(batch);

      const retrieved = await repository.getBatchById(batch.id);

      expect(retrieved?.id).toBe(batch.id);
    });

    it('should return null for non-existent ID', async () => {
      const retrieved = await repository.getBatchById('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('getEntriesByBatchId', () => {
    it('should retrieve all entries for a batch', async () => {
      const batch = createMockBatch();
      await repository.saveBatch(batch);

      const entries = [
        createMockEntry(batch.id),
        createMockEntry(batch.id),
      ];
      await repository.saveEntries(entries);

      const retrieved = await repository.getEntriesByBatchId(batch.id);

      expect(retrieved.length).toBe(2);
    });
  });

  describe('filterEntries', () => {
    it('should filter entries by date range', async () => {
      const batch = createMockBatch();
      await repository.saveBatch(batch);

      const entries = [
        createMockEntry(batch.id, { timestamp: new Date('2024-01-01') }),
        createMockEntry(batch.id, { timestamp: new Date('2024-01-15') }),
        createMockEntry(batch.id, { timestamp: new Date('2024-01-30') }),
      ];
      await repository.saveEntries(entries);

      const filtered = await repository.filterEntries({
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-01-20'),
      });

      expect(filtered.length).toBe(1);
    });

    it('should filter entries by user ID', async () => {
      const batch = createMockBatch();
      await repository.saveBatch(batch);

      const entries = [
        createMockEntry(batch.id, { userId: 'user1' }),
        createMockEntry(batch.id, { userId: 'user2' }),
      ];
      await repository.saveEntries(entries);

      const filtered = await repository.filterEntries({ userId: 'user1' });

      expect(filtered.length).toBe(1);
      expect(filtered[0].userId).toBe('user1');
    });
  });

  describe('getAllBatches', () => {
    it('should return all batches sorted by upload date', async () => {
      const batch1 = createMockBatch({ uploadedAt: new Date('2024-01-01') });
      const batch2 = createMockBatch({ uploadedAt: new Date('2024-01-15') });

      await repository.saveBatch(batch1);
      await repository.saveBatch(batch2);

      const batches = await repository.getAllBatches();

      expect(batches.length).toBe(2);
      expect(batches[0].uploadedAt.getTime()).toBeGreaterThan(batches[1].uploadedAt.getTime());
    });
  });

  describe('deleteBatch', () => {
    it('should delete a batch and its entries', async () => {
      const batch = createMockBatch();
      await repository.saveBatch(batch);
      await repository.saveEntries([createMockEntry(batch.id)]);

      const deleted = await repository.deleteBatch(batch.id);

      expect(deleted).toBe(true);
      expect(await repository.getBatchById(batch.id)).toBeNull();
      expect((await repository.getEntriesByBatchId(batch.id)).length).toBe(0);
    });
  });
});
