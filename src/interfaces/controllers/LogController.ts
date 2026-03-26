import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  UploadLogUseCase,
  AnalyzeLogUseCase,
  GetTopErrorsUseCase,
  GetErrorsByDateUseCase,
  GetRootCauseUseCase,
  FilterEntriesUseCase,
  GetBatchesUseCase,
} from '../../application';
import {
  ApiResponse,
  LogBatchResponseDto,
  AnalysisResultResponseDto,
  ErrorPatternResponseDto,
  RootCauseResponseDto,
  FilteredEntriesResponseDto,
  LogBatchMapper,
  AnalysisResultMapper,
  ErrorPatternMapper,
  RootCauseMapper,
  LogEntryMapper,
} from '../../application';
import { Logger } from '../../shared/logger';
import { NotFoundError } from '../../shared/errors/AppError';

export class LogController {
  constructor(
    private readonly uploadLogUseCase: UploadLogUseCase,
    private readonly analyzeLogUseCase: AnalyzeLogUseCase,
    private readonly getTopErrorsUseCase: GetTopErrorsUseCase,
    private readonly getErrorsByDateUseCase: GetErrorsByDateUseCase,
    private readonly getRootCauseUseCase: GetRootCauseUseCase,
    private readonly filterEntriesUseCase: FilterEntriesUseCase,
    private readonly getBatchesUseCase: GetBatchesUseCase
  ) {}

  uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new NotFoundError('File');
      }

      const batch = await this.uploadLogUseCase.executeFromFile(req.file);

      const response: ApiResponse<LogBatchResponseDto> = {
        success: true,
        data: LogBatchMapper.toDto(batch),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  uploadText = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { content, fileName } = req.body;

      if (!content || typeof content !== 'string') {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Content is required' },
          meta: { timestamp: new Date().toISOString(), requestId: req.requestId },
        });
        return;
      }

      const batch = await this.uploadLogUseCase.executeFromText(content, fileName);

      const response: ApiResponse<LogBatchResponseDto> = {
        success: true,
        data: LogBatchMapper.toDto(batch),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  analyze = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { batchId } = req.params;

      const result = await this.analyzeLogUseCase.execute(batchId);

      const response: ApiResponse<AnalysisResultResponseDto> = {
        success: true,
        data: AnalysisResultMapper.toDto(result),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getTopErrors = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { batchId } = req.params;
      const n = parseInt(req.query.n as string) || 10;
      const category = req.query.category as string | undefined;

      const result = await this.getTopErrorsUseCase.execute(batchId, n, category);

      const response: ApiResponse<ErrorPatternResponseDto[]> = {
        success: true,
        data: result.errors.map(ErrorPatternMapper.toDto),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getErrorsByDate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { batchId } = req.params;
      const { startDate, endDate, category } = req.query;

      const result = await this.getErrorsByDateUseCase.execute(
        batchId,
        startDate as string | undefined,
        endDate as string | undefined,
        category as string | undefined
      );

      const response: ApiResponse<FilteredEntriesResponseDto> = {
        success: true,
        data: {
          entries: result.entries.map(LogEntryMapper.toDto),
          pagination: {
            page: 1,
            limit: result.totalCount,
            total: result.totalCount,
            totalPages: 1,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getRootCause = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { batchId } = req.params;
      const { patternId } = req.query;

      const results = await this.getRootCauseUseCase.execute(
        batchId,
        patternId as string | undefined
      );

      const response: ApiResponse<RootCauseResponseDto[]> = {
        success: true,
        data: results.map(RootCauseMapper.toDto),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  filterEntries = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { batchId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await this.filterEntriesUseCase.execute(
        batchId,
        page,
        limit,
        req.query.startDate as string | undefined,
        req.query.endDate as string | undefined,
        req.query.userId as string | undefined,
        req.query.transactionId as string | undefined,
        req.query.errorCategory as string | undefined,
        req.query.severity as string | undefined
      );

      const response: ApiResponse<FilteredEntriesResponseDto> = {
        success: true,
        data: {
          entries: result.entries.map(LogEntryMapper.toDto),
          pagination: result.pagination,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getBatches = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const batches = await this.getBatchesUseCase.execute();

      const response: ApiResponse<LogBatchResponseDto[]> = {
        success: true,
        data: batches.map(LogBatchMapper.toDto),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: _req.requestId,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
