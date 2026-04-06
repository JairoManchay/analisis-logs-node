import { LogParserStrategy } from '../../domain/interfaces';
export declare class LogParserFactory {
    private static parsers;
    static register(name: string, parser: LogParserStrategy): void;
    static create(name?: string): LogParserStrategy;
    static getAvailableParsers(): string[];
}
//# sourceMappingURL=LogParserFactory.d.ts.map