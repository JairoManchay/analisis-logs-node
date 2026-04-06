"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadLogUseCase = void 0;
const uuid_1 = require("uuid");
const Logger_1 = require("../../shared/Logger");
class UploadLogUseCase {
    repository;
    parserFactory;
    analyzerService;
    logger = Logger_1.Logger.getInstance();
    constructor(repository, parserFactory, analyzerService) {
        this.repository = repository;
        this.parserFactory = parserFactory;
        this.analyzerService = analyzerService;
    }
    async execute(dto) {
        this.logger.info(`Processing file: ${dto.filename}`);
        const parser = this.parserFactory.create('standard');
        const entries = parser.parseStream(dto.buffer);
        const errors = entries.filter(e => e.level === 'E');
        const analysis = this.analyzerService.analyze(entries);
        const parsedFile = {
            id: (0, uuid_1.v4)(),
            filename: dto.filename,
            entries,
            errors,
            analysis,
            createdAt: new Date().toISOString()
        };
        const saved = await this.repository.save(parsedFile);
        this.logger.info(`File processed: ${saved.id}, Errors found: ${errors.length}`);
        return saved;
    }
}
exports.UploadLogUseCase = UploadLogUseCase;
//# sourceMappingURL=UploadLogUseCase.js.map