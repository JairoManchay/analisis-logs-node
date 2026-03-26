import { ILogParser } from '../../domain/interfaces/ILogParser';
import { LogcatParser } from './LogcatParser';
import { BackendLogParser } from './BackendLogParser';
import { DefaultLogParser } from './DefaultLogParser';
import { AndroidLogParser } from './AndroidLogParser';

export enum ParserType {
  LOGCAT = 'logcat',
  BACKEND = 'backend',
  ANDROID = 'android',
  DEFAULT = 'default',
}

export class ParserFactory {
  private readonly parsers: Map<ParserType, ILogParser>;

  constructor() {
    this.parsers = new Map<ParserType, ILogParser>([
      [ParserType.LOGCAT, new LogcatParser()],
      [ParserType.BACKEND, new BackendLogParser()],
      [ParserType.ANDROID, new AndroidLogParser()],
      [ParserType.DEFAULT, new DefaultLogParser()],
    ]);
  }

  getParser(type: string): ILogParser {
    const parserType = type.toLowerCase() as ParserType;
    return this.parsers.get(parserType) || this.parsers.get(ParserType.DEFAULT)!;
  }

  detectAndGetParser(rawLine: string): ILogParser {
    if (this.parsers.get(ParserType.ANDROID)?.canParse(rawLine)) {
      return this.parsers.get(ParserType.ANDROID)!;
    }
    for (const [, parser] of this.parsers) {
      if (parser.canParse(rawLine)) {
        return parser;
      }
    }
    return this.parsers.get(ParserType.DEFAULT)!;
  }

  registerParser(type: ParserType, parser: ILogParser): void {
    this.parsers.set(type, parser);
  }
}
