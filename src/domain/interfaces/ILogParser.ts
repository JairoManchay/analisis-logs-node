import { LogEntry } from '../entities';

export interface LogParserStrategy {
  parse(content: string): LogEntry[];
  parseStream(buffer: Buffer): LogEntry[];
  canParse(line: string): boolean;
}
