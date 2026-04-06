import { LogParserStrategy } from '../../domain/interfaces';
import { LogEntry } from '../../domain/entities';

export class StandardLogParser implements LogParserStrategy {
  private readonly LINE_REGEX = /^(\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d{3})(?:\s+\d+){0,2}\s+([EIW])\s+(\S+.*?):\s*(.*)$/;
  private readonly DNI_REGEX = /\b\d{8}[A-Z]\b/g;
  private readonly DOCUMENT_NUMBER_REGEX = /"document(?:_)?number"\s*:\s*"(\d+)"/g;
  private readonly JSON_MESSAGE_REGEX = /"message"\s*:\s*"([^"]+)"/;
  private readonly ERROR_TAG_REGEX = /^(Error|error|Error\s+Envió)/i;
  private readonly REAL_ERROR_PATTERNS = [
    /Error\s+Envió/i,
    /error\s*:/i,
    /Exception/i,
    /NullPointerException/i,
    /java\.lang\./i,
    /Error in /i,
    /error occurred/i,
    /failed/i,
    /denied/i,
    /unauthorized/i,
    /401\b/,
    /400\b/,
    /500\b/,
    /\berror\b/i
  ];
  private readonly INFO_TAGS = [
    'Toast',
    'AGE',
    'VERIF',
    'EEEWW',
    'CASA',
    'PRODUCTS',
    'EXPENSES',
    'SYNC',
    'INFO',
    'codeselected',
    'Endpoint',
    'ResponseRules',
    'BasicInsurance',
    'FormProposal',
    'Fragment',
    'FlujocomponenteCamara',
    'fragment_client',
    'Estado',
    'ApiCustomer',
    'Lista',
    'getCustomer',
    'phone',
    'address',
    'pulling',
    'Respuesta',
    'Tag',
    'AUTORIZATION'
  ];

  public parse(content: string): LogEntry[] {
    const lines = content.split('\n');
    return this.parseLines(lines);
  }

  public parseStream(buffer: Buffer): LogEntry[] {
    const content = buffer.toString('utf-8');
    return this.parse(content);
  }

  public canParse(line: string): boolean {
    return this.LINE_REGEX.test(line.trim());
  }

  private parseLines(lines: string[]): LogEntry[] {
    const entries: LogEntry[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('---------')) continue;

      const entry = this.parseLine(line, i + 1);
      if (entry) {
        entries.push(entry);
      }
    }

    return entries;
  }

  private parseLine(line: string, lineNumber: number): LogEntry | null {
    const match = line.match(this.LINE_REGEX);
    const jsonPayload = this.extractJsonPayload(line);
    const requestId = this.extractRequestId(line);
    
    if (!match) {
      return {
        lineNumber,
        timestamp: '',
        level: 'I',
        message: line,
        rawLine: line,
        jsonPayload,
        requestId
      };
    }

    const [, date, time, level, tag, rest] = match;
    const dni = this.extractDNI(rest);
    const message = this.extractMessage(rest, tag);

    return {
      lineNumber,
      timestamp: `${date} ${time}`,
      level: level as 'E' | 'W' | 'I',
      service: tag,
      dni,
      message,
      rawLine: line,
      jsonPayload,
      requestId
    };
  }

  private extractRequestId(line: string): string | undefined {
    const match = line.match(/Endpoint[a-f0-9-]{8,}/i);
    if (match) {
      return match[0];
    }
    return undefined;
  }

  private extractDNI(text: string): string | undefined {
    const dniMatch = text.match(this.DNI_REGEX);
    if (dniMatch) {
      return dniMatch[0];
    }

    const docMatch = text.match(this.DOCUMENT_NUMBER_REGEX);
    if (docMatch) {
      return docMatch[1];
    }
    
    const jsonObj = this.extractJsonObject(text);
    if (jsonObj) {
      const docNumber = (jsonObj.document_number || jsonObj.documnet_number || jsonObj.documentNumber) as string | undefined;
      if (docNumber) {
        return docNumber;
      }
    }

    return undefined;
  }

  private extractJsonObject(text: string): Record<string, unknown> | null {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }

  private extractMessage(text: string, tag: string): string {
    const jsonMatch = text.match(this.JSON_MESSAGE_REGEX);
    if (jsonMatch) {
      return jsonMatch[1];
    }

    if (this.ERROR_TAG_REGEX.test(tag) || text.includes('Error')) {
      const parts = text.split(':');
      if (parts.length > 1) {
        return parts.slice(1).join(':').trim();
      }
    }
    
    return text;
  }

  public extractJsonPayload(line: string): Record<string, unknown> | undefined {
    const jsonMatch = line.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return undefined;
    
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
        return parsed;
      }
    } catch {}
    return undefined;
  }
}
