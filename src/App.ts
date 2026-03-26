import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { AppConfig } from './shared/config/AppConfig';
import { Logger } from './shared/logger';
import {
  errorHandler,
  requestIdMiddleware,
  requestLoggerMiddleware,
} from './shared/middleware';
import { createLogRoutes, createHealthRoutes } from './interfaces/routes';
import { LogController } from './interfaces/controllers/LogController';
import { InMemoryLogRepository } from './infrastructure/repositories/InMemoryLogRepository';
import { LogAnalyzer, ErrorClassifier } from './infrastructure/services';
import { ParserFactory } from './infrastructure/parsers/ParserFactory';
import {
  UploadLogUseCase,
  AnalyzeLogUseCase,
  GetTopErrorsUseCase,
  GetErrorsByDateUseCase,
  GetRootCauseUseCase,
  FilterEntriesUseCase,
  GetBatchesUseCase,
} from './application';

class Application {
  private app: Express;
  private config: AppConfig;

  constructor() {
    this.config = AppConfig.getInstance();
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors(this.config.getCorsOptions()));
    this.app.use(compression());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this.app.use(requestIdMiddleware);
    this.app.use(requestLoggerMiddleware);
  }

  private setupRoutes(): void {
    const repository = new InMemoryLogRepository();
    const logAnalyzer = new LogAnalyzer();
    const errorClassifier = new ErrorClassifier();
    const parserFactory = new ParserFactory();

    const uploadLogUseCase = new UploadLogUseCase(
      repository,
      parserFactory,
      errorClassifier,
      Logger,
      this.config.contextLines
    );

    const analyzeLogUseCase = new AnalyzeLogUseCase(repository, logAnalyzer, Logger);
    const getTopErrorsUseCase = new GetTopErrorsUseCase(repository, logAnalyzer, Logger);
    const getErrorsByDateUseCase = new GetErrorsByDateUseCase(repository, Logger);
    const getRootCauseUseCase = new GetRootCauseUseCase(repository, logAnalyzer, Logger);
    const filterEntriesUseCase = new FilterEntriesUseCase(repository, logAnalyzer, Logger);
    const getBatchesUseCase = new GetBatchesUseCase(repository, Logger);

    const logController = new LogController(
      uploadLogUseCase,
      analyzeLogUseCase,
      getTopErrorsUseCase,
      getErrorsByDateUseCase,
      getRootCauseUseCase,
      filterEntriesUseCase,
      getBatchesUseCase
    );

    this.app.use('/health', createHealthRoutes());
    this.app.use('/logs', createLogRoutes(logController));
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.config.port, this.config.host, () => {
      Logger.info(`Server started on http://${this.config.host}:${this.config.port}`);
      Logger.info(`Environment: ${this.config.isDevelopment ? 'development' : 'production'}`);
    });
  }

  public getApp(): Express {
    return this.app;
  }
}

export const app = new Application();
