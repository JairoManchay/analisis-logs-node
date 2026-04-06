import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { Logger } from '../../../shared/Logger';
import { AppError } from '../../../shared/errors/AppError';
import { InMemoryLogRepository } from '../../repositories';
import { LogParserFactory, LogAnalyzerService } from '../../../application/services';
import { UploadLogUseCase, GetErrorsUseCase } from '../../../application/usecases';
import { FilterQuerySchema } from '../../validation';

const logger = Logger.getInstance();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (_, file, cb) => {
    const isTextFile = file.mimetype === 'text/plain' || 
                       file.originalname.endsWith('.txt') ||
                       file.mimetype === 'application/octet-stream';
    if (isTextFile) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }
});

const repository = new InMemoryLogRepository();
const analyzerService = new LogAnalyzerService();
const uploadUseCase = new UploadLogUseCase(repository, LogParserFactory, analyzerService);
const getErrorsUseCase = new GetErrorsUseCase(repository, analyzerService);

const app = express();
app.use(express.json());

app.post('/logs/upload', upload.single('log'), async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (error) {
    next(error);
  }
});

app.post('/logs/analyze', upload.single('log'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadUseCase.execute({
      filename: req.file.originalname,
      buffer: req.file.buffer
    });

    res.json(result.analysis);
  } catch (error) {
    next(error);
  }
});

app.get('/logs/errors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryResult = FilterQuerySchema.safeParse(req.query);
    
    if (!queryResult.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: queryResult.error.issues
      });
    }

    const result = await getErrorsUseCase.execute(queryResult.data);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message);
  
  if (err instanceof AppError) {
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

export { app };
