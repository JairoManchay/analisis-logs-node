import { v4 as uuidv4 } from 'uuid';
import { ParsedLogFile } from '../../domain/entities';
import { ILogRepository } from '../../domain/interfaces';
import { LogParserFactory, LogAnalyzerService } from '../services';
import { Logger } from '../../shared/Logger';

export interface UploadLogDTO {
  filename: string;
  buffer: Buffer;
}

export class UploadLogUseCase {
  private logger = Logger.getInstance();

  constructor(
    private readonly repository: ILogRepository,
    private readonly parserFactory: typeof LogParserFactory,
    private readonly analyzerService: LogAnalyzerService
  ) {}

  async execute(dto: UploadLogDTO): Promise<ParsedLogFile> {
    this.logger.info(`Processing file: ${dto.filename}`);

    const parser = this.parserFactory.create('standard');
    const entries = parser.parseStream(dto.buffer);
    const errors = entries.filter(e => e.level === 'E');
    const analysis = this.analyzerService.analyze(entries);

    const parsedFile: ParsedLogFile = {
      id: uuidv4(),
      filename: dto.filename,
      entries,
      errors,
      analysis,
      createdAt: new Date().toISOString()
    };

    const saved = await this.repository.save(parsedFile);
    this.logger.info(`File processed: ${saved.id}, Errors found: ${errors.length}`);

    return saved;
  }
}
