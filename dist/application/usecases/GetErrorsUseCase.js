"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetErrorsUseCase = void 0;
const AppError_1 = require("../../shared/errors/AppError");
class GetErrorsUseCase {
    repository;
    analyzerService;
    constructor(repository, analyzerService) {
        this.repository = repository;
        this.analyzerService = analyzerService;
    }
    async execute(dto) {
        let logs;
        if (dto.logId) {
            const log = await this.getLogById(dto.logId);
            if (!log) {
                throw new AppError_1.NotFoundError(`Log with id ${dto.logId} not found`);
            }
            logs = [log];
        }
        else {
            logs = await this.repository.findAll();
        }
        const allErrors = logs.flatMap(log => {
            if (!log.analysis)
                return [];
            return log.analysis.errors;
        });
        let filteredErrors = allErrors;
        if (dto.dni) {
            filteredErrors = this.analyzerService.filterByDNI(filteredErrors, dto.dni);
        }
        if (dto.service) {
            filteredErrors = this.analyzerService.filterByService(filteredErrors, dto.service);
        }
        if (dto.endpoint) {
            filteredErrors = this.analyzerService.filterByEndpoint(filteredErrors, dto.endpoint);
        }
        if (dto.environment) {
            filteredErrors = this.analyzerService.filterByEnvironment(filteredErrors, dto.environment);
        }
        if (dto.requestId) {
            filteredErrors = this.analyzerService.filterByRequestId(filteredErrors, dto.requestId);
        }
        const sorted = filteredErrors.sort((a, b) => b.count - a.count);
        return {
            mostFrequentError: sorted[0] || this.createEmptyErrorGroup(),
            errors: sorted
        };
    }
    async getLogById(id) {
        return this.repository.findById(id);
    }
    createEmptyErrorGroup() {
        return {
            message: 'N/A',
            service: 'N/A',
            line: 0,
            count: 0,
            dnIs: [],
            errorType: 'unknown',
            endpoint: undefined,
            environment: undefined,
            errorCode: undefined,
            requestId: undefined,
            relatedEntries: undefined
        };
    }
}
exports.GetErrorsUseCase = GetErrorsUseCase;
//# sourceMappingURL=GetErrorsUseCase.js.map