export declare class Logger {
    private static instance;
    private logs;
    private constructor();
    static getInstance(): Logger;
    info(message: string): void;
    error(message: string): void;
    warn(message: string): void;
    private log;
    getLogs(): {
        timestamp: string;
        level: string;
        message: string;
    }[];
    clear(): void;
}
//# sourceMappingURL=Logger.d.ts.map