# Log Analyzer API

Intelligent log analysis system built with Clean Architecture, TypeScript, and Express.

## Features

- Upload log files (.log, .txt) or send plain text logs
- Intelligent error detection and classification
- Pattern recognition using regex
- Root cause analysis
- Date and metadata filtering
- Top N errors reporting
- HTTP status code analysis

## Architecture

The project follows Clean Architecture principles with these layers:

```
src/
├── domain/           # Business entities, interfaces, value objects
├── application/       # Use cases, DTOs, mappers
├── infrastructure/   # Services, parsers, repositories
├── interfaces/       # Controllers, routes
└── shared/          # Config, logger, middleware, errors
```

### Design Patterns Used

- **Factory Pattern**: `ParserFactory` for creating log parsers
- **Strategy Pattern**: Different parsers for logcat, backend logs
- **Builder Pattern**: `LogEntryEntity`, `LogBatchEntity`
- **Singleton Pattern**: Logger, AppConfig
- **Repository Pattern**: `InMemoryLogRepository`
- **Dependency Injection**: Through constructor injection

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Testing

```bash
npm test
```

## API Endpoints

### Health Check
```
GET /health
```

### Upload Log File
```
POST /logs/upload
Content-Type: multipart/form-data

file: <log file>
```

### Upload Log Text
```
POST /logs/upload-text
Content-Type: application/json

{
  "content": "log content...",
  "fileName": "optional.txt"
}
```

### Analyze Logs
```
POST /logs/analyze/:batchId
```

### Get Top Errors
```
GET /logs/errors/top/:batchId?n=10&category=NETWORK
```

### Get Errors by Date
```
GET /logs/errors/by-date/:batchId?startDate=2024-01-01&endDate=2024-01-31
```

### Get Root Cause Analysis
```
GET /logs/errors/root-cause/:batchId?patternId=optional
```

### Filter Entries
```
GET /logs/filter/:batchId?page=1&limit=50&errorCategory=SERVER&severity=HIGH
```

### Get All Batches
```
GET /logs/batches
```

## Error Categories

- `NETWORK` - Network connectivity issues
- `VALIDATION` - Data validation errors
- `SERVER` - Internal server errors
- `DATABASE` - Database errors
- `AUTHENTICATION` - Auth failures
- `AUTHORIZATION` - Permission errors
- `TIMEOUT` - Timeout errors
- `RATE_LIMIT` - Rate limiting
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Bad request errors
- `UNKNOWN` - Uncategorized errors

## Severity Levels

- `CRITICAL` - Immediate action required
- `HIGH` - High priority
- `MEDIUM` - Moderate priority
- `LOW` - Low priority

## Example Usage

### Upload and Analyze

```bash
# Upload a log file
curl -X POST http://localhost:3000/logs/upload \
  -F "file=@app.log"

# Get analysis results
curl http://localhost:3000/logs/analyze/{batchId}

# Get top 5 errors
curl http://localhost:3000/logs/errors/top/{batchId}?n=5
```

## License

MIT
