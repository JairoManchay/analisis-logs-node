"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogParserFactory = void 0;
const StandardLogParser_1 = require("./StandardLogParser");
class LogParserFactory {
    static parsers = new Map();
    static {
        this.register('standard', new StandardLogParser_1.StandardLogParser());
    }
    static register(name, parser) {
        this.parsers.set(name, parser);
    }
    static create(name = 'standard') {
        const parser = this.parsers.get(name);
        if (!parser) {
            throw new Error(`Parser "${name}" not found`);
        }
        return parser;
    }
    static getAvailableParsers() {
        return Array.from(this.parsers.keys());
    }
}
exports.LogParserFactory = LogParserFactory;
//# sourceMappingURL=LogParserFactory.js.map