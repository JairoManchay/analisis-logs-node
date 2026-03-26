import { ILogRepository } from '../../domain/interfaces/ILogRepository';
import { LogBatch, LogEntry, AnalysisResult } from '../../domain/entities';
import { FilterCriteria } from '../../domain/interfaces/ILogAnalyzer';

export class InMemoryLogRepository implements ILogRepository {
  private readonly batches: Map<string, LogBatch> = new Map();
  private readonly entries: Map<string, LogEntry[]> = new Map();
  private readonly analysisResults: Map<string, AnalysisResult> = new Map();

  async saveBatch(batch: LogBatch): Promise<LogBatch> {
    this.batches.set(batch.id, batch);
    this.entries.set(batch.id, []);
    return batch;
  }

  async saveEntries(entries: LogEntry[]): Promise<LogEntry[]> {
    if (entries.length === 0) return [];

    const batchId = entries[0].metadata?.batchId as string;
    if (batchId && this.entries.has(batchId)) {
      const existingEntries = this.entries.get(batchId)!;
      this.entries.set(batchId, [...existingEntries, ...entries]);
    }
    return entries;
  }

  async saveAnalysisResult(result: AnalysisResult): Promise<AnalysisResult> {
    this.analysisResults.set(result.batchId, result);
    return result;
  }

  async getBatchById(batchId: string): Promise<LogBatch | null> {
    return this.batches.get(batchId) || null;
  }

  async getEntriesByBatchId(batchId: string): Promise<LogEntry[]> {
    return this.entries.get(batchId) || [];
  }

  async getAnalysisResultByBatchId(batchId: string): Promise<AnalysisResult | null> {
    return this.analysisResults.get(batchId) || null;
  }

  async filterEntries(criteria: FilterCriteria): Promise<LogEntry[]> {
    const allEntries: LogEntry[] = [];
    
    for (const entries of this.entries.values()) {
      allEntries.push(...entries);
    }

    return this.applyFilters(allEntries, criteria);
  }

  async getAllBatches(): Promise<LogBatch[]> {
    return Array.from(this.batches.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }

  async deleteBatch(batchId: string): Promise<boolean> {
    const deleted = this.batches.delete(batchId);
    this.entries.delete(batchId);
    this.analysisResults.delete(batchId);
    return deleted;
  }

  async deleteEntriesByBatchId(batchId: string): Promise<boolean> {
    const existed = this.entries.has(batchId);
    this.entries.delete(batchId);
    return existed;
  }

  private applyFilters(entries: LogEntry[], criteria: FilterCriteria): LogEntry[] {
    let filtered = [...entries];

    if (criteria.startDate) {
      filtered = filtered.filter(e =>
        e.timestamp !== null && e.timestamp >= criteria.startDate!
      );
    }

    if (criteria.endDate) {
      filtered = filtered.filter(e =>
        e.timestamp !== null && e.timestamp <= criteria.endDate!
      );
    }

    if (criteria.userId) {
      filtered = filtered.filter(e =>
        e.userId !== null && e.userId.toLowerCase().includes(criteria.userId!.toLowerCase())
      );
    }

    if (criteria.transactionId) {
      filtered = filtered.filter(e =>
        e.transactionId !== null && e.transactionId.toLowerCase().includes(criteria.transactionId!.toLowerCase())
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

  clear(): void {
    this.batches.clear();
    this.entries.clear();
    this.analysisResults.clear();
  }
}
