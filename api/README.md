# API Documentation

This folder contains the OpenAPI/Swagger specification for the Log Analyzer API.

## Files

- `swagger.yaml` - OpenAPI 3.0 specification

## View Documentation

### Option 1: Swagger Editor (Online)
1. Go to https://editor.swagger.io/
2. Copy the contents of `swagger.yaml`
3. Paste into the editor
4. View interactive documentation

### Option 2: Swagger UI (Local)
```bash
# Using Docker
docker run -p 8080:8080 -v $(pwd)/swagger.yaml:/api/swagger.yaml swaggerapi/swagger-ui

# Then open http://localhost:8080
```

### Option 3: ReDoc (Local)
```bash
# Using Docker
docker run -p 8080:8080 -v $(pwd)/swagger.yaml:/api/swagger.yaml redocly/redoc

# Then open http://localhost:8080
```

### Option 4: VS Code Extension
Install "Swagger Viewer" or "OpenAPI extension" in VS Code

## Convert to Other Formats

```bash
# Install swagger-cli
npm install -g @apidevtools/swagger-cli

# Validate
swagger-cli validate swagger.yaml

# Bundle (resolve references)
swagger-cli bundle -o swagger-bundled.yaml swagger.yaml

# Convert to JSON
swagger-cli bundle -o swagger.json -r swagger.yaml
```

## API Overview

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check |
| POST | `/logs/upload` | Upload log file |
| POST | `/logs/upload-text` | Upload log text |
| POST | `/logs/analyze/{batchId}` | Analyze logs |
| GET | `/logs/errors/top/{batchId}` | Top N errors |
| GET | `/logs/errors/by-date/{batchId}` | Errors by date |
| GET | `/logs/errors/root-cause/{batchId}` | Root cause analysis |
| GET | `/logs/filter/{batchId}` | Filter entries |
| GET | `/logs/batches` | List all batches |

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

## Example Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileName": "app.log",
    "totalLines": 100,
    "totalErrors": 15,
    "totalWarnings": 5,
    "totalInfo": 80,
    "processedLines": 100,
    "uploadedAt": "2024-01-15T10:30:00.000Z",
    "source": "file"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "uuid"
  }
}
```
