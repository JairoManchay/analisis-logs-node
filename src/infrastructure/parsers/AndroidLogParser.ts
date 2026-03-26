import { ILogParser, ParsedLine } from '../../domain/interfaces/ILogParser';
import { LogcatTag } from '../../domain/entities/AndroidLogInterfaces';

export class AndroidLogParser implements ILogParser {
  private readonly logPattern = /^(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+)\s+(\d+)\s+([ADEVIW])\s+(\w+)\s*:\s*(.+)$/;

  canParse(rawLine: string): boolean {
    return this.logPattern.test(rawLine);
  }

  async parse(rawLine: string, lineNumber: number): Promise<ParsedLine> {
    const match = rawLine.match(this.logPattern);
    
    if (!match) {
      return this.parseGenericLine(rawLine, lineNumber);
    }

    const [, timestamp, pid, tid, , tag, message] = match;
    const parsedTag = this.normalizeTag(tag);

    const result: ParsedLine = {
      timestamp: this.parseTimestamp(timestamp),
      level: this.mapLevel('E'),
      message: message,
      source: parsedTag,
      stackTrace: null,
      httpStatus: null,
      transactionId: null,
      userId: null,
      metadata: {
        pid: parseInt(pid, 10),
        tid: parseInt(tid, 10),
        tag: parsedTag,
        rawTimestamp: timestamp,
      } as unknown as Record<string, unknown>,
    };

    this.enrichMetadata(result, parsedTag, message);

    return result;
  }

  private parseGenericLine(rawLine: string, _lineNumber: number): ParsedLine {
    return {
      timestamp: null,
      level: 'INFO',
      message: rawLine,
      source: 'unknown',
      stackTrace: null,
      httpStatus: null,
      transactionId: null,
      userId: null,
      metadata: {},
    };
  }

  private normalizeTag(tag: string): LogcatTag {
    const tagMap: Record<string, LogcatTag> = {
      'EEEWW': 'EEEWW',
      'VERIFY': 'VERIFY',
      'AUTORIZATION': 'AUTORIZATION',
      'CASA': 'CASA',
      'INFO TASAS': 'INFO TASAS',
      'Error Envió': 'Error Envió',
      'Estado de la Red': 'Estado de la Red',
      'PRODUCTS': 'PRODUCTS',
      'EXPENSES': 'EXPENSES',
      'fragment_client': 'fragment_client',
      'AGE': 'AGE',
      'Toast': 'Toast',
      'error': 'error',
      'SYNC': 'SYNC',
      'INFO RULE GUARANTEE': 'INFO RULE GUARANTEE',
      'Product': 'Product',
      'FlujocomponenteCamara': 'FlujocomponenteCamara',
      'ResponseRules': 'ResponseRules',
      'codeselected': 'codeselected',
      'BasicInsurance': 'BasicInsurance',
      'FormProposalFragment': 'FormProposalFragment',
      'Endpoint': 'Endpoint',
      'FormProposalViewModel': 'FormProposalViewModel',
      'ApiCustomer': 'ApiCustomer',
      'Respuesta phone': 'Respuesta phone',
      'Respuesta address': 'Respuesta address',
      'Lista de creditos': 'Lista de creditos',
      'pulling json': 'pulling json',
      'get Documentos Requeridos': 'get Documentos Requeridos',
      'Id instancia de proceso': 'Id instancia de proceso',
      'RESPONSE DATABASE': 'RESPONSE DATABASE',
      'Tag getCustomer': 'Tag getCustomer',
    };

    return tagMap[tag] || (tag as LogcatTag);
  }

  private mapLevel(level: string): string {
    const levelMap: Record<string, string> = {
      'V': 'VERBOSE',
      'D': 'DEBUG',
      'I': 'INFO',
      'W': 'WARN',
      'E': 'ERROR',
      'A': 'ASSERT',
      'F': 'FATAL',
    };
    return levelMap[level] || 'INFO';
  }

  private parseTimestamp(rawTimestamp: string): Date {
    const currentYear = new Date().getFullYear();
    const fullTimestamp = `${currentYear}-${rawTimestamp}`;
    return new Date(fullTimestamp);
  }

  private enrichMetadata(result: ParsedLine, tag: LogcatTag, message: string): void {
    try {
      switch (tag) {
        case 'Error Envió':
          this.parseHttpError(result, message);
          break;
        case 'INFO TASAS':
        case 'INFO RULE GUARANTEE':
          result.metadata.parsedJson = JSON.parse(message);
          break;
        case 'PRODUCTS':
        case 'EXPENSES':
          result.metadata.parsedJson = message === 'null' ? null : JSON.parse(message);
          break;
        case 'fragment_client':
          this.parseCustomerFragment(result, message);
          break;
        case 'AGE':
          this.parseAge(result, message);
          break;
        case 'SYNC':
          result.metadata.parsedJson = JSON.parse(message);
          break;
        case 'ResponseRules':
          result.metadata.parsedJson = JSON.parse(message.split(': ')[1] || message);
          break;
        case 'Product':
          result.metadata.parsedJson = JSON.parse(message);
          break;
        case 'Endpoint':
          this.parseEndpointCall(result, message);
          break;
        case 'FormProposalFragment':
          this.parseFormProposal(result, message);
          break;
        case 'FormProposalViewModel':
          if (message.includes('java.lang.')) {
            result.stackTrace = this.parseStackTrace(message);
            result.level = 'ERROR';
          } else if (message.startsWith('Error in getDpsDocumentsRequired')) {
            result.message = message;
          }
          break;
        case 'ApiCustomer':
        case 'Tag getCustomer':
          result.metadata.parsedJson = JSON.parse(message.split('->')[1] || message);
          break;
        case 'Respuesta phone':
        case 'Respuesta address':
          result.metadata.parsedJson = JSON.parse(message);
          break;
        case 'Lista de creditos':
          result.metadata.parsedJson = JSON.parse(message.split(': ')[1] || message);
          break;
        case 'get Documentos Requeridos':
          result.metadata.parsedJson = JSON.parse(message);
          break;
        case 'Id instancia de proceso':
          result.metadata.parsedJson = JSON.parse(message);
          break;
        case 'RESPONSE DATABASE':
          result.metadata.parsedJson = JSON.parse(message);
          break;
        case 'BasicInsurance':
          if (message.includes('onSelectDiscrumbranceToSaveRate')) {
            result.metadata.value = message.split(': ')[1];
          }
          break;
        case 'codeselected':
          result.metadata.value = message;
          break;
        case 'AUTORIZATION':
          result.metadata.jwtToken = message;
          break;
        case 'VERIFY':
        case 'EEEWW':
        case 'CASA':
          result.metadata.value = message;
          break;
      }
    } catch {
      result.metadata.parseError = 'Failed to parse message content';
    }
  }

  private parseHttpError(result: ParsedLine, message: string): void {
    const errorMatch = message.match(/\{.*?\}--\/\/--\/\s*code\s*:\s*(\d+)/);
    if (errorMatch) {
      try {
        const errorData = JSON.parse(errorMatch[1]);
        result.metadata.httpError = errorData;
        result.httpStatus = parseInt(errorMatch[2], 10);
        result.level = 'ERROR';
      } catch {
        result.metadata.rawError = message;
      }
    }
  }

  private parseCustomerFragment(result: ParsedLine, message: string): void {
    const match = message.match(/fragment_client:\s+(.+?)\s+->\s*(.+)/);
    if (match) {
      result.metadata.info = {
        type: match[1].trim(),
        value: match[2].trim(),
      };
    }

    const segmentMatch = message.match(/fragment_client:\s+Old segment obtained\s+->\s+(.+)/);
    if (segmentMatch) {
      result.metadata.segment = segmentMatch[1].trim();
    }
  }

  private parseAge(result: ParsedLine, message: string): void {
    const dateMatch = message.match(/\d{4}-\d{2}-\d{2}\s+-\s+\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      const [birthDate, currentDate] = message.replace('AGE     : ', '').split(' - ');
      result.metadata.age = { birthDate, currentDate };
    } else {
      const ageMatch = message.match(/AGE\s*:\s*(\d+)/);
      if (ageMatch) {
        result.metadata.ageValue = parseInt(ageMatch[1], 10);
      }
    }
  }

  private parseEndpointCall(result: ParsedLine, message: string): void {
    const parts = message.split(': ');
    if (parts.length >= 4) {
      result.metadata.endpoint = {
        id: parts[0].replace('Endpoint', ''),
        path: parts[1],
        request: parts[2],
        status: parts[3].trim(),
        response: parts[4] || '',
      };
    }
  }

  private parseFormProposal(result: ParsedLine, message: string): void {
    const parts = message.split(': ');
    if (parts.length >= 3) {
      const lastPart = parts.slice(2).join(': ');
      if (lastPart.startsWith('{')) {
        try {
          result.metadata.formProposal = JSON.parse(lastPart);
        } catch {
          result.metadata.formProposalRaw = lastPart;
        }
      } else {
        result.metadata.formProposalCode = parts[2].trim();
      }
    }
  }

  private parseStackTrace(message: string): string {
    const exceptionMatch = message.match(/(java\.\w+\.\w+Exception|java\.\w+\.\w+Error):\s*(.+)/);
    if (exceptionMatch) {
      return `${exceptionMatch[1]}: ${exceptionMatch[2]}`;
    }
    return message;
  }
}
