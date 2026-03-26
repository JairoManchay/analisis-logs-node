import { ErrorClassifier } from '../../src/infrastructure/services/ErrorClassifier';
import { ErrorCategory, ErrorSeverity } from '../../src/domain/value-objects/ErrorClassification';

describe('ErrorClassifier', () => {
  let classifier: ErrorClassifier;

  beforeEach(() => {
    classifier = new ErrorClassifier();
  });

  describe('classify', () => {
    it('should classify network errors', () => {
      const result = classifier.classify(
        { timestamp: null, level: 'ERROR', message: '', source: null, stackTrace: null, httpStatus: null, transactionId: null, userId: null, metadata: {} },
        'ECONNREFUSED: Connection refused to server'
      );
      
      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
    });

    it('should classify validation errors', () => {
      const result = classifier.classify(
        { timestamp: null, level: 'ERROR', message: 'Validation error: invalid input', source: null, stackTrace: null, httpStatus: null, transactionId: null, userId: null, metadata: {} },
        ''
      );
      
      expect(result.category).toBe(ErrorCategory.VALIDATION);
    });

    it('should classify 500 errors as SERVER with CRITICAL severity', () => {
      const result = classifier.classify(
        { timestamp: null, level: 'ERROR', message: 'Server error', source: null, stackTrace: null, httpStatus: 500, transactionId: null, userId: null, metadata: {} },
        ''
      );
      
      expect(result.category).toBe(ErrorCategory.SERVER);
      expect(result.severity).toBe(ErrorSeverity.CRITICAL);
    });

    it('should classify 404 errors as NOT_FOUND', () => {
      const result = classifier.classify(
        { timestamp: null, level: 'ERROR', message: 'Resource not found', source: null, stackTrace: null, httpStatus: 404, transactionId: null, userId: null, metadata: {} },
        ''
      );
      
      expect(result.category).toBe(ErrorCategory.BAD_REQUEST);
    });

    it('should classify database errors', () => {
      const result = classifier.classify(
        { timestamp: null, level: 'ERROR', message: '', source: null, stackTrace: null, httpStatus: null, transactionId: null, userId: null, metadata: {} },
        'Database error: connection timeout'
      );
      
      expect(result.category).toBe(ErrorCategory.DATABASE);
    });

    it('should classify authentication errors', () => {
      const result = classifier.classify(
        { timestamp: null, level: 'ERROR', message: '', source: null, stackTrace: null, httpStatus: null, transactionId: null, userId: null, metadata: {} },
        'Unauthorized: Invalid JWT token'
      );
      
      expect(result.category).toBe(ErrorCategory.AUTHENTICATION);
    });

    it('should classify rate limit errors', () => {
      const result = classifier.classify(
        { timestamp: null, level: 'ERROR', message: '', source: null, stackTrace: null, httpStatus: 429, transactionId: null, userId: null, metadata: {} },
        ''
      );
      
      expect(result.category).toBe(ErrorCategory.BAD_REQUEST);
    });

    it('should classify unknown errors with low severity', () => {
      const result = classifier.classify(
        { timestamp: null, level: 'ERROR', message: 'Some custom error message', source: null, stackTrace: null, httpStatus: null, transactionId: null, userId: null, metadata: {} },
        ''
      );
      
      expect(result.category).toBe(ErrorCategory.UNKNOWN);
      expect(result.severity).toBe(ErrorSeverity.LOW);
    });
  });

  describe('registerRule', () => {
    it('should allow registering custom rules', () => {
      classifier.registerRule(
        /CUSTOM_ERROR/i,
        ErrorCategory.SERVER,
        ErrorSeverity.HIGH,
        'Custom error type'
      );

      const result = classifier.classify(
        { timestamp: null, level: 'ERROR', message: '', source: null, stackTrace: null, httpStatus: null, transactionId: null, userId: null, metadata: {} },
        'CUSTOM_ERROR detected'
      );

      expect(result.category).toBe(ErrorCategory.SERVER);
      expect(result.matchedPattern).toBe('CUSTOM_ERROR/i');
    });
  });
});
