import { ErrorGroup, LogEntry, LogAnalysisResult } from '../../domain/entities';

export class LogAnalyzerService {
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
    /FATAL/i,
    /IllegalStateException/i,
    /\berror\b/i,
    /\/API\//i
  ];
  private readonly HTTP_ERROR_PATTERNS = [
    /401\b/,
    /400\b/,
    /500\b/,
    /denied/i,
    /unauthorized/i,
    /forbidden/i,
    /Error\s+Envió/i
  ];
  private readonly IGNORE_TAGS = [
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
    'ResponseRules',
    'BasicInsurance',
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
    'AUTORIZATION',
    'Product',
    'CurrentId',
    'ViewRootImpl',
    'PESTAÑA',
    'Prospecto',
    'RULES',
    'DATOS',
    'SELECCION',
    'DPS',
    'Selection',
    'FieldOnResume',
    'AbsListView',
    'DeserializadorResponseInhibitory',
    'CreditsActiveSerializer'
  ];

  public analyze(entries: LogEntry[]): LogAnalysisResult {
    const errors = entries.filter(e => e.level === 'E' && this.isRealError(e));
    const groupedErrors = this.groupErrors(errors);
    const sortedErrors = this.sortByCount(groupedErrors);

    return {
      mostFrequentError: sortedErrors[0] || this.createEmptyErrorGroup(),
      errors: sortedErrors,
      totalErrors: errors.length,
      totalLines: entries.length,
      analyzedAt: new Date().toISOString()
    };
  }

  private isRealError(entry: LogEntry): boolean {
    const tag = entry.service?.toUpperCase() || '';
    const message = entry.message;

    if (this.IGNORE_TAGS.some(ignoreTag => tag.includes(ignoreTag))) {
      return false;
    }

    if (message.startsWith('{') && message.endsWith('}')) {
      try {
        const json = JSON.parse(message);
        
        if (json.status === true || json.isContingence === 0) {
          const hasErrorField = json.error || json.errorMessage || json.code >= 400;
          const hasErrorInMessage = /error|failed|denied|no autorizado|objeto no|saldo|multiples|timeout|exception/i.test(json.message || json.resultMessage || '');
          
          if (!hasErrorField && !hasErrorInMessage) {
            return false;
          }
        }
      } catch {}
    }

    if (this.REAL_ERROR_PATTERNS.some(pattern => pattern.test(message))) {
      return true;
    }

    if (/Error|error|Exception|Failed|INSTANCIA|RESPONSE|DATABASE|Endpoint/i.test(tag)) {
      return true;
    }

    if (/\/API\/[A-Z]+-[A-Z]+\/[A-Z]+\//i.test(message)) {
      return true;
    }

    return false;
  }

  private getErrorType(message: string, tag?: string): 'http_error' | 'validation_rule' | 'unknown' {
    if (message.startsWith('{') && message.endsWith('}')) {
      try {
        const json = JSON.parse(message);
        
        if (json.status === true || json.isContingence === 0) {
          const hasErrorField = json.error || json.errorMessage || json.code >= 400;
          const hasErrorInMessage = /error|failed|denied|no autorizado|objeto no|saldo|multiples|timeout|exception/i.test(json.message || json.resultMessage || '');
          
          if (!hasErrorField && !hasErrorInMessage) {
            return 'unknown';
          }
          return 'validation_rule';
        }
      } catch {}
    }

    if (this.HTTP_ERROR_PATTERNS.some(pattern => pattern.test(message))) {
      return 'http_error';
    }
    if (/rule|validación|validation|verif|error\s*:|failed|denied|objeto no|saldo|multiples|no autorizado|timeout/i.test(message)) {
      return 'validation_rule';
    }
    if (/Error|error|Exception|Failed|get\s+Document|obtener|requeridos/i.test(tag || '')) {
      return 'validation_rule';
    }
    return 'unknown';
  }

  private extractEndpoint(message: string): string | undefined {
    const urlMatch = message.match(/\/API\/[^\s]+/i);
    if (urlMatch) {
      return urlMatch[0];
    }
    return undefined;
  }

  private extractEnvironment(message: string): string | undefined {
    const envMatch = message.match(/\/API\/[^\/]+\/([A-Z]+)\//i);
    if (envMatch) {
      return envMatch[1].toUpperCase();
    }
    return undefined;
  }

  private extractErrorCode(message: string): string | undefined {
    const codeMatch = message.match(/(?:code|error|status)[:\s]*(\d+)/i);
    if (codeMatch) {
      return codeMatch[1];
    }
    const httpMatch = message.match(/\b(401|400|403|404|500|502|503)\b/);
    if (httpMatch) {
      return httpMatch[1];
    }
    return undefined;
  }

  private extractReason(message: string): string {
    const reasonMatch = message.match(/(?:reason|cause|error|due to)[:\s]+(.+)/i);
    if (reasonMatch) {
      return reasonMatch[1].trim();
    }
    return message;
  }

  public filterByDNI(errors: ErrorGroup[], dni: string): ErrorGroup[] {
    return errors.filter(group => 
      group.dnIs.some(d => d.includes(dni))
    );
  }

  public filterByService(errors: ErrorGroup[], service: string): ErrorGroup[] {
    return errors.filter(group => 
      group.service.toLowerCase().includes(service.toLowerCase())
    );
  }

  public filterByRequestId(errors: ErrorGroup[], requestId: string): ErrorGroup[] {
    return errors.filter(group => 
      group.requestId?.includes(requestId)
    );
  }

  private groupErrors(errors: LogEntry[]): ErrorGroup[] {
    const groups = new Map<string, ErrorGroup>();

    for (const error of errors) {
      const key = this.generateKey(error);
      const errorType = this.getErrorType(error.message, error.service);
      const normalizedMessage = error.message.trim();
      const endpoint = this.extractEndpoint(error.message);
      const environment = this.extractEnvironment(error.message);
      const errorCode = this.extractErrorCode(error.message);
      const requestId = error.requestId;
      
      if (groups.has(key)) {
        const group = groups.get(key)!;
        group.count++;
        if (error.dni && !group.dnIs.includes(error.dni)) {
          group.dnIs.push(error.dni);
        }
        if (errorType === 'validation_rule' && error.jsonPayload) {
          const existingPayloads = group.jsonPayloads || [];
          const payloadStr = JSON.stringify(error.jsonPayload);
          if (!existingPayloads.some(p => JSON.stringify(p) === payloadStr)) {
            group.jsonPayloads = [...existingPayloads, error.jsonPayload];
          }
        }
        const reason = this.extractReason(error.message);
        if (reason && !group.reasons?.includes(reason)) {
          group.reasons = group.reasons || [];
          group.reasons.push(reason);
        }
        if (endpoint && !group.endpoint) group.endpoint = endpoint;
        if (environment && !group.environment) group.environment = environment;
        if (errorCode && !group.errorCode) group.errorCode = errorCode;
        if (requestId && !group.requestId) group.requestId = requestId;
        if (requestId && error.rawLine && !group.relatedEntries?.includes(error.rawLine)) {
          group.relatedEntries = group.relatedEntries || [];
          group.relatedEntries.push(error.rawLine);
        }
      } else {
        groups.set(key, {
          message: normalizedMessage,
          service: (error.service || 'N/A').trim().replace(/\s+/g, ' '),
          line: error.lineNumber,
          count: 1,
          dnIs: error.dni ? [error.dni] : [],
          errorType,
          jsonPayloads: errorType === 'validation_rule' && error.jsonPayload ? [error.jsonPayload] : undefined,
          reasons: [this.extractReason(error.message)],
          endpoint,
          environment,
          errorCode,
          requestId,
          relatedEntries: requestId ? [error.rawLine] : undefined
        });
      }
    }

    return Array.from(groups.values());
  }

  private generateKey(error: LogEntry): string {
    const normalizedService = (error.service || 'N/A').trim().replace(/\s+/g, ' ');
    const normalizedMessage = error.message.trim();
    return `${normalizedMessage}|${normalizedService}`;
  }

  private sortByCount(groups: ErrorGroup[]): ErrorGroup[] {
    return groups.sort((a, b) => b.count - a.count);
  }

  private createEmptyErrorGroup(): ErrorGroup {
    return {
      message: 'N/A',
      service: 'N/A',
      line: 0,
      count: 0,
      dnIs: [],
      errorType: 'unknown',
      endpoint: undefined,
      environment: undefined,
      errorCode: undefined
    };
  }

  public filterByEndpoint(errors: ErrorGroup[], endpoint: string): ErrorGroup[] {
    return errors.filter(group => 
      group.endpoint?.toLowerCase().includes(endpoint.toLowerCase()) ||
      group.service?.toLowerCase().includes(endpoint.toLowerCase()) ||
      group.message?.toLowerCase().includes(endpoint.toLowerCase())
    );
  }

  public filterByEnvironment(errors: ErrorGroup[], environment: string): ErrorGroup[] {
    return errors.filter(group => 
      group.environment === environment.toUpperCase()
    );
  }
}
