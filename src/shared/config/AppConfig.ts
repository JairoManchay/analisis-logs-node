export class AppConfig {
  private static instance: AppConfig;

  readonly port: number;
  readonly host: string;
  readonly uploadDir: string;
  readonly maxFileSize: number;
  readonly logLevel: string;
  readonly isDevelopment: boolean;
  readonly contextLines: number;
  readonly corsOrigins: string[];

  private constructor() {
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.host = process.env.HOST || '0.0.0.0';
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '104857600', 10);
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.contextLines = parseInt(process.env.CONTEXT_LINES || '3', 10);
    this.corsOrigins = (process.env.CORS_ORIGINS || '*').split(',');
  }

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  getCorsOptions(): {
    origin: string | string[] | boolean;
    credentials: boolean;
  } {
    return {
      origin: this.corsOrigins.length === 1 && this.corsOrigins[0] === '*'
        ? true
        : this.corsOrigins,
      credentials: true,
    };
  }
}
