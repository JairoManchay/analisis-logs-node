export interface ILogParser {
  parse(rawLine: string, lineNumber: number): Promise<ParsedLine>;
  canParse(rawLine: string): boolean;
}

export interface ParsedLine {
  timestamp: Date | null;
  level: string | null;
  message: string;
  source: string | null;
  stackTrace: string | null;
  httpStatus: number | null;
  transactionId: string | null;
  userId: string | null;
  metadata: Record<string, unknown>;
}
