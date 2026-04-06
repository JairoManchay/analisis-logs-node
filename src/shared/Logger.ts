export class Logger {
  private static instance: Logger;
  private logs: Array<{ timestamp: string; level: string; message: string }> = [];

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string): void {
    this.log('INFO', message);
  }

  public error(message: string): void {
    this.log('ERROR', message);
  }

  public warn(message: string): void {
    this.log('WARN', message);
  }

  private log(level: string, message: string): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };
    this.logs.push(entry);
    console.log(`[${level}] ${entry.timestamp}: ${message}`);
  }

  public getLogs() {
    return [...this.logs];
  }

  public clear(): void {
    this.logs = [];
  }
}
