"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static instance;
    logs = [];
    constructor() { }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    info(message) {
        this.log('INFO', message);
    }
    error(message) {
        this.log('ERROR', message);
    }
    warn(message) {
        this.log('WARN', message);
    }
    log(level, message) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message
        };
        this.logs.push(entry);
        console.log(`[${level}] ${entry.timestamp}: ${message}`);
    }
    getLogs() {
        return [...this.logs];
    }
    clear() {
        this.logs = [];
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map