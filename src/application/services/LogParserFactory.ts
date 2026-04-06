import { LogParserStrategy } from '../../domain/interfaces';
import { StandardLogParser } from './StandardLogParser';

export class LogParserFactory {
  private static parsers: Map<string, LogParserStrategy> = new Map();

  static {
    this.register('standard', new StandardLogParser());
  }

  static register(name: string, parser: LogParserStrategy): void {
    this.parsers.set(name, parser);
  }

  static create(name: string = 'standard'): LogParserStrategy {
    const parser = this.parsers.get(name);
    if (!parser) {
      throw new Error(`Parser "${name}" not found`);
    }
    return parser;
  }

  static getAvailableParsers(): string[] {
    return Array.from(this.parsers.keys());
  }
}
