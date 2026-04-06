"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const Logger_1 = require("../../../shared/Logger");
const AppError_1 = require("../../../shared/errors/AppError");
const repositories_1 = require("../../repositories");
const services_1 = require("../../../application/services");
const usecases_1 = require("../../../application/usecases");
const validation_1 = require("../../validation");
const logger = Logger_1.Logger.getInstance();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (_, file, cb) => {
        const isTextFile = file.mimetype === 'text/plain' ||
            file.originalname.endsWith('.txt') ||
            file.mimetype === 'application/octet-stream';
        if (isTextFile) {
            cb(null, true);
        }
        else {
            cb(new Error('Only .txt files are allowed'));
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 }
});
const repository = new repositories_1.InMemoryLogRepository();
const analyzerService = new services_1.LogAnalyzerService();
const uploadUseCase = new usecases_1.UploadLogUseCase(repository, services_1.LogParserFactory, analyzerService);
const getErrorsUseCase = new usecases_1.GetErrorsUseCase(repository, analyzerService);
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
app.post('/logs/upload', upload.single('log'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const result = await uploadUseCase.execute({
            filename: req.file.originalname,
            buffer: req.file.buffer
        });
        res.status(201).json({
            id: result.id,
            filename: result.filename,
            totalLines: result.analysis?.totalLines,
            totalErrors: result.analysis?.totalErrors,
            message: 'Log file uploaded and analyzed successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
app.post('/logs/analyze', upload.single('log'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const result = await uploadUseCase.execute({
            filename: req.file.originalname,
            buffer: req.file.buffer
        });
        res.json(result.analysis);
    }
    catch (error) {
        next(error);
    }
});
app.get('/logs/errors', async (req, res, next) => {
    try {
        const queryResult = validation_1.FilterQuerySchema.safeParse(req.query);
        if (!queryResult.success) {
            return res.status(400).json({
                error: 'Invalid query parameters',
                details: queryResult.error.issues
            });
        }
        const result = await getErrorsUseCase.execute(queryResult.data);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
app.use((err, _req, res, _next) => {
    logger.error(err.message);
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            error: err.code,
            message: err.message,
            details: err.details
        });
    }
    res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
    });
});
//# sourceMappingURL=LogController.js.map