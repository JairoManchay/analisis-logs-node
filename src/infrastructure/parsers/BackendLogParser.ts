import { ILogParser, ParsedLine } from '../../domain/interfaces/ILogParser';

export class BackendLogParser implements ILogParser {
  private readonly patterns = {
    timestampISO: /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)/,
    timestampCommon: /^\[?(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\]?/,
    level: /\[(DEBUG|INFO|WARN|WARNING|ERROR|ERR|FATAL|TRACE)\]|(?:\b(ERROR|ERR|FATAL|WARN|WARNING|INFO|DEBUG|TRACE)\b)/i,
    source: /\[([\w.]+)\]|source:\s*([\w.]+)/i,
    status: /status[:\s]+(\d{3})/i,
    transactionId: /transactionId[:\s]+([\w-]+)/i,
    userId: /(?:userId|user_id|user)[:\s]+([\w@.-]+)/i,
    stackTrace: /^\s+at\s+[\w.$<>]+\(.*\)$/,
    httpStatus: /\b(1\d{2}|2\d{2}|3\d{2}|4\d{2}|5\d{2})\b/,
  };

  canParse(rawLine: string): boolean {
    return this.patterns.timestampCommon.test(rawLine) || 
           this.patterns.timestampISO.test(rawLine) ||
           this.patterns.level.test(rawLine);
  }

  async parse(rawLine: string, lineNumber: number): Promise<ParsedLine> {
    const result: ParsedLine = {
      timestamp: null,
      level: null,
      message: rawLine,
      source: 'backend',
      stackTrace: null,
      httpStatus: null,
      transactionId: null,
      userId: null,
      metadata: {},
    };

    const isoMatch = rawLine.match(this.patterns.timestampISO);
    const commonMatch = rawLine.match(this.patterns.timestampCommon);
    
    if (isoMatch) {
      result.timestamp = new Date(isoMatch[1]);
    } else if (commonMatch) {
      const dateStr = commonMatch[1].trim();
      const cleaned = dateStr.replace(/\s+/, 'T');
      result.timestamp = new Date(cleaned.includes('T') ? cleaned : `${cleaned}+00:00`);
    }

    const levelMatch = rawLine.match(this.patterns.level);
    if (levelMatch) {
      const level = (levelMatch[1] || levelMatch[2] || '').toUpperCase();
      result.level = level === 'WARNING' ? 'WARN' : level;
    }

    const sourceMatch = rawLine.match(this.patterns.source);
    if (sourceMatch) {
      result.source = sourceMatch[1] || sourceMatch[2] || 'backend';
    }

    const statusMatch = rawLine.match(this.patterns.status);
    if (statusMatch) {
      result.httpStatus = parseInt(statusMatch[1], 10);
    }

    const httpMatch = rawLine.match(this.patterns.httpStatus);
    if (httpMatch && !statusMatch) {
      const status = parseInt(httpMatch[1], 10);
      if (status >= 400) {
        result.httpStatus = status;
      }
    }

    const txMatch = rawLine.match(this.patterns.transactionId);
    if (txMatch) {
      result.transactionId = txMatch[1];
    }

    const userMatch = rawLine.match(this.patterns.userId);
    if (userMatch) {
      result.userId = userMatch[1];
    }

    const lines = rawLine.split('\n');
    if (lines.length > 1) {
      result.message = lines[0];
      result.stackTrace = lines.slice(1).join('\n');
    }

    result.metadata.parser = 'backend';

    return result;
  }
}
