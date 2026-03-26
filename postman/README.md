# Postman Collection

This folder contains ready-to-use API requests for the Log Analyzer API.

## Files

- `LogAnalyzer-API.postman_collection.json` - Postman Collection (import into Postman)
- `curl-commands.bat` - Windows batch file with curl commands
- `curl-commands.sh` - Linux/Mac bash script with curl commands

## Quick Start

### 1. Postman
1. Open Postman
2. Click **Import**
3. Select `LogAnalyzer-API.postman_collection.json`
4. Click **Collections** > **LogAnalyzer-API**
5. Run requests from the collection

### 2. Windows (curl)
```cmd
cd postman
curl-commands.bat
```

### 3. Linux/Mac (curl)
```bash
chmod +x curl-commands.sh
./curl-commands.sh
```

## Manual curl Examples

### Health Check
```bash
curl http://localhost:3000/health
```

### Upload Log File
```bash
curl -X POST http://localhost:3000/logs/upload -F "file=@your-log.log"
```

### Upload Log Text (Standard Format)
```bash
curl -X POST http://localhost:3000/logs/upload-text \
  -H "Content-Type: application/json" \
  -d '{"content":"2024-01-15 ERROR: Failed\n2024-01-15 ERROR: Failed", "fileName":"app.log"}'
```

### Upload Log Text (Android/SURGIR App Format)
```bash
curl -X POST http://localhost:3000/logs/upload-text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "03-23 09:01:36.401 30735 30735 E Error Envió: {\"message\":\"No Autorizado\",\"error\":[{\"code\":\"401\"}]}--//--// code : 401\n03-23 09:01:39.552 30735 30735 E AGE     : 37\n03-23 09:04:24.315 30735 30735 E PRODUCTS: [{\"id\":1038,\"name\":\"Venta de comida\"}]\n03-23 09:09:26.147 30735 30735 E FormProposalViewModel: java.lang.NullPointerException",
    "fileName": "surgir-android.log"
  }'
```

The Android/SURGIR parser automatically extracts:
- JWT tokens and auth info
- HTTP errors (401, 400, etc.) with error details
- Customer data (birthdate, age, civil status)
- Products and expenses
- Insurance rules and proposals
- Java stack traces

### Get Top Errors
```bash
curl "http://localhost:3000/logs/errors/top/{batchId}?n=10"
```

### Filter Entries
```bash
curl "http://localhost:3000/logs/filter/{batchId}?errorCategory=NETWORK"
```

## Workflow

1. **Upload logs** using `/logs/upload` or `/logs/upload-text`
2. **Copy the batch ID** from the response
3. **Analyze logs** with `/logs/analyze/{batchId}`
4. **Get insights** with:
   - `/logs/errors/top/{batchId}` - Most frequent errors
   - `/logs/errors/root-cause/{batchId}` - Root cause analysis
   - `/logs/filter/{batchId}` - Detailed filtering

## Environment Variables

In Postman, set up an environment with:
- `baseUrl`: `http://localhost:3000`
- `batchId`: Your batch ID from upload response

## Supported Log Formats

### Standard Log Format
Simple timestamp + level + message format:
```
2024-01-15 10:30:00 ERROR: Database connection failed
```

### Android/SURGIR App Format
Native Android logcat format from the SURGIR credit application:
```
03-23 09:01:36.401 30735 30735 E Error Envió: {"message":"No Autorizado"}--//--// code : 401
03-23 09:01:39.552 30735 30735 E AGE     : 37
03-23 09:09:26.147 30735 30735 E FormProposalViewModel: java.lang.NullPointerException
```

The system automatically detects the format and applies the appropriate parser.
