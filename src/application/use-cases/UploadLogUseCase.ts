import { ILogRepository } from '../../domain/interfaces/ILogRepository';
import { ILogParser } from '../../domain/interfaces/ILogParser';
import { IErrorClassifier } from '../../domain/interfaces/IErrorClassifier';
import { LogBatch, LogBatchCreateParams, LogEntry, LogEntryCreateParams, LogEntryEntity, LogBatchEntity } from '../../domain';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import { ILogger } from '../../shared/logger/ILogger';

export interface ILogParserFactory {
  getParser(source: string): ILogParser;
}

export class UploadLogUseCase {
  constructor(
    private readonly logRepository: ILogRepository,
    private readonly parserFactory: ILogParserFactory,
    private readonly errorClassifier: IErrorClassifier,
    private readonly logger: ILogger,
    private readonly contextLines: number = 3
  ) {}

  async executeFromFile(
    file: Express.Multer.File,
    fileStream?: Readable
  ): Promise<LogBatch> {
    this.logger.info(`Processing log file: ${file.originalname}`, {
      size: file.size,
      mimetype: file.mimetype,
    });

    const batchId = uuidv4();
    const batchParams: LogBatchCreateParams = {
      id: batchId,
      fileName: file.originalname,
      totalLines: 0,
      totalErrors: 0,
      totalWarnings: 0,
      totalInfo: 0,
      processedLines: 0,
      uploadedAt: new Date(),
      source: 'file',
    };

    const batch = new LogBatchEntity(batchParams);
    const entries: LogEntry[] = [];
    const lines: string[] = [];

    const stream = fileStream || Readable.from(file.buffer.toString('utf-8').split('\n'));
    let lineNumber = 0;

    const defaultParser = this.parserFactory.getParser('default');

    for await (const line of stream) {
      lineNumber++;
      lines.push(line);

      const canParse = defaultParser.canParse(line);
      if (!canParse) {
        batch.totalLines++;
        continue;
      }

      const parsed = await defaultParser.parse(line, lineNumber);
      const classification = this.errorClassifier.classify(parsed, line);

      const previousLines = lines.slice(-this.contextLines - 1, -1);
      const nextLines: string[] = [];

      const entryParams: LogEntryCreateParams = {
        lineNumber,
        rawLine: line,
        timestamp: parsed.timestamp,
        level: parsed.level,
        message: parsed.message,
        source: parsed.source,
        stackTrace: parsed.stackTrace,
        httpStatus: parsed.httpStatus,
        transactionId: parsed.transactionId,
        userId: parsed.userId,
        metadata: { ...parsed.metadata, batchId },
        previousLines,
        nextLines,
      };

      const entry = new LogEntryEntity(uuidv4(), entryParams, classification);
      entries.push(entry);
      batch.totalLines++;
      batch.processedLines++;

      this.updateBatchCounts(batch, entry.level);
    }

    for (let i = 0; i < entries.length; i++) {
      if (i > 0) {
        entries[i].previousLines = [lines[entries[i].lineNumber - 2]].filter(Boolean);
      }
      if (i < entries.length - 1) {
        entries[i].nextLines = [lines[entries[i].lineNumber]].filter(Boolean);
      }
    }

    const savedBatch = await this.logRepository.saveBatch(batch);
    await this.logRepository.saveEntries(entries);

    this.logger.info(`Log file processed: ${batch.totalLines} lines, ${batch.totalErrors} errors`, {
      batchId: savedBatch.id,
    });

    return savedBatch;
  }

  async executeFromText(content: string, fileName?: string): Promise<LogBatch> {
    this.logger.info(`Processing log text${fileName ? `: ${fileName}` : ''}`, {
      length: content.length,
    });

    const batchId = uuidv4();
    const batchParams: LogBatchCreateParams = {
      id: batchId,
      fileName: fileName || null,
      totalLines: 0,
      totalErrors: 0,
      totalWarnings: 0,
      totalInfo: 0,
      processedLines: 0,
      uploadedAt: new Date(),
      source: 'text',
    };

    const batch = new LogBatchEntity(batchParams);
    const entries: LogEntry[] = [];
    const lines = content.split('\n');
    const defaultParser = this.parserFactory.getParser('default');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      if (!line.trim()) {
        batch.totalLines++;
        continue;
      }

      const canParse = defaultParser.canParse(line);
      if (!canParse) {
        batch.totalLines++;
        continue;
      }

      const parsed = await defaultParser.parse(line, lineNumber);
      const classification = this.errorClassifier.classify(parsed, line);

      const previousLines = lines.slice(Math.max(0, i - this.contextLines), i);
      const nextLines = lines.slice(i + 1, Math.min(lines.length, i + this.contextLines + 1));

      const entryParams: LogEntryCreateParams = {
        lineNumber,
        rawLine: line,
        timestamp: parsed.timestamp,
        level: parsed.level,
        message: parsed.message,
        source: parsed.source,
        stackTrace: parsed.stackTrace,
        httpStatus: parsed.httpStatus,
        transactionId: parsed.transactionId,
        userId: parsed.userId,
        metadata: { ...parsed.metadata, batchId },
        previousLines,
        nextLines,
      };

      const entry = new LogEntryEntity(uuidv4(), entryParams, classification);
      entries.push(entry);
      batch.totalLines++;
      batch.processedLines++;

      this.updateBatchCounts(batch, entry.level);
    }

    const savedBatch = await this.logRepository.saveBatch(batch);
    await this.logRepository.saveEntries(entries);

    this.logger.info(`Log text processed: ${batch.totalLines} lines, ${batch.totalErrors} errors`, {
      batchId: savedBatch.id,
    });

    return savedBatch;
  }

  private updateBatchCounts(batch: LogBatch, level: string | null): void {
    if (!level) return;

    const upperLevel = level.toUpperCase();
    if (['ERROR', 'ERR', 'FATAL', 'CRITICAL'].includes(upperLevel)) {
      batch.totalErrors++;
    } else if (['WARN', 'WARNING'].includes(upperLevel)) {
      batch.totalWarnings++;
    } else if (['INFO', 'DEBUG', 'TRACE'].includes(upperLevel)) {
      batch.totalInfo++;
    }
  }
}
