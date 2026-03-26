import { DefaultLogParser } from '../../src/infrastructure/parsers/DefaultLogParser';
import { BackendLogParser } from '../../src/infrastructure/parsers/BackendLogParser';
import { LogcatParser } from '../../src/infrastructure/parsers/LogcatParser';
import { ParserFactory, ParserType } from '../../src/infrastructure/parsers/ParserFactory';

describe('DefaultLogParser', () => {
  let parser: DefaultLogParser;

  beforeEach(() => {
    parser = new DefaultLogParser();
  });

  describe('canParse', () => {
    it('should return true for non-empty lines', () => {
      expect(parser.canParse('Error occurred')).toBe(true);
      expect(parser.canParse('INFO: Application started')).toBe(true);
    });

    it('should return false for empty lines', () => {
      expect(parser.canParse('')).toBe(false);
      expect(parser.canParse('   ')).toBe(false);
    });
  });

  describe('parse', () => {
    it('should detect ERROR level', async () => {
      const result = await parser.parse('2024-01-15 10:30:00 ERROR: Database connection failed', 1);
      expect(result.level).toBe('ERROR');
    });

    it('should detect WARN level', async () => {
      const result = await parser.parse('WARNING: High memory usage detected', 1);
      expect(result.level).toBe('WARN');
    });

    it('should detect INFO level', async () => {
      const result = await parser.parse('[INFO] Server started on port 3000', 1);
      expect(result.level).toBe('INFO');
    });

    it('should detect HTTP 500 status', async () => {
      const result = await parser.parse('Request failed with status 500', 1);
      expect(result.httpStatus).toBe(500);
    });

    it('should detect HTTP 404 status', async () => {
      const result = await parser.parse('Resource not found: 404', 1);
      expect(result.httpStatus).toBe(404);
    });

    it('should extract transaction ID', async () => {
      const result = await parser.parse('TransactionId: abc-123-def', 1);
      expect(result.transactionId).toBe('abc-123-def');
    });

    it('should extract user ID', async () => {
      const result = await parser.parse('userId: john@example.com', 1);
      expect(result.userId).toBe('john@example.com');
    });
  });
});

describe('BackendLogParser', () => {
  let parser: BackendLogParser;

  beforeEach(() => {
    parser = new BackendLogParser();
  });

  describe('canParse', () => {
    it('should detect common backend log format', () => {
      expect(parser.canParse('[2024-01-15 10:30:00] [ERROR] Message')).toBe(true);
      expect(parser.canParse('2024-01-15T10:30:00.000Z ERROR: Message')).toBe(true);
    });
  });

  describe('parse', () => {
    it('should parse ISO timestamp', async () => {
      const result = await parser.parse('2024-01-15T10:30:00.000Z ERROR: Connection failed', 1);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.level).toBe('ERROR');
    });

    it('should parse common timestamp format', async () => {
      const result = await parser.parse('[2024-01-15 10:30:00] ERROR: Database error', 1);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.level).toBe('ERROR');
    });

    it('should extract HTTP status', async () => {
      const result = await parser.parse('2024-01-15 10:30:00 ERROR status:500', 1);
      expect(result.httpStatus).toBe(500);
    });
  });
});

describe('LogcatParser', () => {
  let parser: LogcatParser;

  beforeEach(() => {
    parser = new LogcatParser();
  });

  describe('canParse', () => {
    it('should detect logcat format', () => {
      expect(parser.canParse('2024-01-15 10:30:00.123 E/Tag: Error message')).toBe(true);
    });
  });

  describe('parse', () => {
    it('should parse logcat error level', async () => {
      const result = await parser.parse('2024-01-15 10:30:00.123 E/MyTag: NullPointerException', 1);
      expect(result.level).toBe('ERROR');
      expect(result.source).toBe('MyTag');
    });

    it('should parse logcat warning level', async () => {
      const result = await parser.parse('2024-01-15 10:30:00.123 W/WarningTag: Resource low', 1);
      expect(result.level).toBe('WARN');
    });
  });
});

describe('ParserFactory', () => {
  let factory: ParserFactory;

  beforeEach(() => {
    factory = new ParserFactory();
  });

  it('should return correct parser type', () => {
    expect(factory.getParser('logcat')).toBeInstanceOf(LogcatParser);
    expect(factory.getParser('backend')).toBeInstanceOf(BackendLogParser);
    expect(factory.getParser('default')).toBeInstanceOf(DefaultLogParser);
  });

  it('should return default parser for unknown type', () => {
    const parser = factory.getParser('unknown');
    expect(parser).toBeInstanceOf(DefaultLogParser);
  });
});
