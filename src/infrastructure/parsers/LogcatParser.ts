import { ILogParser, ParsedLine } from '../../domain/interfaces/ILogParser';

export class LogcatParser implements ILogParser {
  private readonly patterns = {
    timestamp: /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d{3})?)/,
    level: /\b([VDIWEFA])\b/,
    tag: /([\w.$]+):/,
    pid: /^\s*(\d+)\s+/,
    message: /:\s*(.+)$/,
    stackTrace: /^\s+at\s+[\w.$]+\(.*\)$/,
  };

  canParse(rawLine: string): boolean {
    return this.patterns.timestamp.test(rawLine) || this.patterns.level.test(rawLine);
  }

  async parse(rawLine: string, lineNumber: number): Promise<ParsedLine> {
    const result: ParsedLine = {
      timestamp: null,
      level: null,
      message: rawLine,
      source: 'logcat',
      stackTrace: null,
      httpStatus: null,
      transactionId: null,
      userId: null,
      metadata: {},
    };

    const timestampMatch = rawLine.match(this.patterns.timestamp);
    if (timestampMatch) {
      result.timestamp = new Date(timestampMatch[1].trim());
    }

    const levelMatch = rawLine.match(this.patterns.level);
    if (levelMatch) {
      const levelChar = levelMatch[1];
      const levelMap: Record<string, string> = {
        V: 'VERBOSE',
        D: 'DEBUG',
        I: 'INFO',
        W: 'WARN',
        E: 'ERROR',
        F: 'FATAL',
        A: 'ASSERT',
      };
      result.level = levelMap[levelChar] || levelChar;
    }

    const tagMatch = rawLine.match(this.patterns.tag);
    if (tagMatch) {
      result.source = tagMatch[1];
    }

    const pidMatch = rawLine.match(this.patterns.pid);
    if (pidMatch) {
      result.metadata.pid = parseInt(pidMatch[1], 10);
    }

    const messageMatch = rawLine.match(this.patterns.message);
    if (messageMatch) {
      result.message = messageMatch[1].trim();
    }

    result.metadata.parser = 'logcat';

    return result;
  }
}
