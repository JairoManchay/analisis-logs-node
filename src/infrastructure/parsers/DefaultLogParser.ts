import { ILogParser, ParsedLine } from '../../domain/interfaces/ILogParser';

export class DefaultLogParser implements ILogParser {
  async parse(rawLine: string, lineNumber: number): Promise<ParsedLine> {
    return {
      timestamp: null,
      level: this.detectLevel(rawLine),
      message: rawLine,
      source: null,
      stackTrace: null,
      httpStatus: this.detectHttpStatus(rawLine),
      transactionId: this.extractTransactionId(rawLine),
      userId: this.extractUserId(rawLine),
      metadata: {},
    };
  }

  canParse(rawLine: string): boolean {
    return rawLine.trim().length > 0;
  }

  private detectLevel(line: string): string | null {
    const upperLine = line.toUpperCase();
    
    if (/\b(FATAL|CRITICAL)\b/.test(upperLine)) return 'FATAL';
    if (/\b(ERROR|ERR)\b/.test(upperLine)) return 'ERROR';
    if (/\b(WARN|WARNING)\b/.test(upperLine)) return 'WARN';
    if (/\b(INFO)\b/.test(upperLine)) return 'INFO';
    if (/\b(DEBUG)\b/.test(upperLine)) return 'DEBUG';
    if (/\b(TRACE)\b/.test(upperLine)) return 'TRACE';
    
    return null;
  }

  private detectHttpStatus(line: string): number | null {
    const match = line.match(/\b([45]\d{2})\b/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  private extractTransactionId(line: string): string | null {
    const patterns = [
      /(?:transaction[_-]?id|txn[_-]?id|txid)[:\s]+([\w-]+)/i,
      /\[([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\]/i,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  private extractUserId(line: string): string | null {
    const patterns = [
      /(?:user[_-]?id|user)[:\s]+([\w@.-]+)/i,
      /(?:dni|id)[:\s]+([\w]+)/i,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) return match[1];
    }

    return null;
  }
}
