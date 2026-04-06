"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardLogParser = void 0;
class StandardLogParser {
    LINE_REGEX = /^(\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d{3})(?:\s+\d+){0,2}\s+([EIW])\s+(\S+.*?):\s*(.*)$/;
    DNI_REGEX = /\b\d{8}[A-Z]\b/g;
    DOCUMENT_NUMBER_REGEX = /"document(?:_)?number"\s*:\s*"(\d+)"/g;
    JSON_MESSAGE_REGEX = /"message"\s*:\s*"([^"]+)"/;
    ERROR_TAG_REGEX = /^(Error|error|Error\s+Envió)/i;
    REAL_ERROR_PATTERNS = [
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
    INFO_TAGS = [
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
    parse(content) {
        const lines = content.split('\n');
        return this.parseLines(lines);
    }
    parseStream(buffer) {
        const content = buffer.toString('utf-8');
        return this.parse(content);
    }
    canParse(line) {
        return this.LINE_REGEX.test(line.trim());
    }
    parseLines(lines) {
        const entries = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('---------'))
                continue;
            const entry = this.parseLine(line, i + 1);
            if (entry) {
                entries.push(entry);
            }
        }
        return entries;
    }
    parseLine(line, lineNumber) {
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
            level: level,
            service: tag,
            dni,
            message,
            rawLine: line,
            jsonPayload,
            requestId
        };
    }
    extractRequestId(line) {
        const match = line.match(/Endpoint[a-f0-9-]{8,}/i);
        if (match) {
            return match[0];
        }
        return undefined;
    }
    extractDNI(text) {
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
            const docNumber = (jsonObj.document_number || jsonObj.documnet_number || jsonObj.documentNumber);
            if (docNumber) {
                return docNumber;
            }
        }
        return undefined;
    }
    extractJsonObject(text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return null;
        try {
            return JSON.parse(jsonMatch[0]);
        }
        catch {
            return null;
        }
    }
    extractMessage(text, tag) {
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
    extractJsonPayload(line) {
        const jsonMatch = line.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return undefined;
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
                return parsed;
            }
        }
        catch { }
        return undefined;
    }
}
exports.StandardLogParser = StandardLogParser;
//# sourceMappingURL=StandardLogParser.js.map