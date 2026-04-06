import { LogParserStrategy } from '../../domain/interfaces';
import { LogEntry } from '../../domain/entities';
export declare class StandardLogParser implements LogParserStrategy {
    private readonly LINE_REGEX;
    private readonly DNI_REGEX;
    private readonly DOCUMENT_NUMBER_REGEX;
    private readonly JSON_MESSAGE_REGEX;
    private readonly ERROR_TAG_REGEX;
    private readonly REAL_ERROR_PATTERNS;
    private readonly INFO_TAGS;
    parse(content: string): LogEntry[];
    parseStream(buffer: Buffer): LogEntry[];
    canParse(line: string): boolean;
    private parseLines;
    private parseLine;
    private extractRequestId;
    private extractDNI;
    private extractJsonObject;
    private extractMessage;
    extractJsonPayload(line: string): Record<string, unknown> | undefined;
}
//# sourceMappingURL=StandardLogParser.d.ts.map