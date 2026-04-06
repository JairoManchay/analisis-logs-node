# Log Analyzer API

API para análisis inteligente de logs con detección de errores repetidos.

## 🚀 Instalación

```bash
npm install
```

## 🏃 Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build && npm start
```

## 📡 Endpoints

### POST /logs/upload
Sube un archivo de log y retorna ID del análisis.

```bash
curl -X POST -F "log=@sample.log" http://localhost:3000/logs/upload
```

**Respuesta:**
```json
{
  "id": "uuid-del-analisis",
  "filename": "sample.log",
  "totalLines": 20,
  "totalErrors": 11,
  "message": "Log file uploaded and analyzed successfully"
}
```

### POST /logs/analyze
Sube un archivo de log y retorna análisis completo.

```bash
curl -X POST -F "log=@sample.log" http://localhost:3000/logs/analyze
```

**Respuesta:**
```json
{
  "mostFrequentError": {
    "message": "El objeto no fue encontrado",
    "service": "/API/MID-CORE-BANK/PRD/V1/customer",
    "line": 5,
    "count": 5,
    "dnIs": ["12345678A"]
  },
  "errors": [
    {
      "message": "El objeto no fue encontrado",
      "service": "/API/MID-CORE-BANK/PRD/V1/customer",
      "line": 5,
      "count": 5,
      "dnIs": ["12345678A"]
    },
    {
      "message": "multiples cambiso isntanctances",
      "service": "/API/MID-CORE-BANK/PRD/V1/account",
      "line": 22,
      "count": 4,
      "dnIs": []
    },
    {
      "message": "Timeout de conexión",
      "service": "/API/MID-CORE-BANK/PRD/V1/account",
      "line": 8,
      "count": 1,
      "dnIs": ["87654321B"]
    },
    {
      "message": "Saldo insuficiente",
      "service": "/API/MID-CORE-BANK/PRD/V1/transaction",
      "line": 17,
      "count": 1,
      "dnIs": []
    }
  ],
  "totalErrors": 11,
  "totalLines": 20,
  "analyzedAt": "2026-03-31T..."
}
```

### GET /logs/errors
Obtiene errores con filtros opcionales.

```bash
# Sin filtros
curl http://localhost:3000/logs/errors

# Filtrar por DNI
curl "http://localhost:3000/logs/errors?dni=12345678A"

# Filtrar por servicio
curl "http://localhost:3000/logs/errors?service=customer"
```

## 🏗️ Arquitectura

```
src/
├── domain/
│   ├── entities/        # LogEntry, ErrorGroup, ParsedLogFile
│   └── interfaces/     # ILogParser, ILogRepository
├── application/
│   ├── services/       # StandardLogParser, LogParserFactory, LogAnalyzerService
│   └── usecases/      # UploadLogUseCase, GetErrorsUseCase
├── infrastructure/
│   ├── repositories/  # InMemoryLogRepository
│   ├── validation/    # Zod schemas
│   └── http/          # Express controllers
├── interfaces/        # ILogController
└── shared/           # Logger, AppError
```

## 🧩 Patrones Implementados

| Patrón | Ubicación | Propósito |
|--------|-----------|-----------|
| Strategy | `StandardLogParser` | Parseo flexible de logs |
| Factory | `LogParserFactory` | Creación de parsers |
| Repository | `InMemoryLogRepository` | Persistencia de datos |
| Builder | Respuestas DTO | Construcción de respuestas |
| Singleton | `Logger` | Logging global |

## 🔧 Tecnologías

- Node.js + TypeScript
- Express.js
- Multer (upload archivos)
- Zod (validación)
- Soporte para archivos grandes

## 📝 Formato de Log Esperado

```
MM-DD HH:MM:SS.mmm [LEVEL] mensaje
03-23 10:03:13.960 E Error Envió: {"message":"El objeto no fue encontrado"}
03-23 10:03:13.961 E Endpoint92fede...: /API/MID-CORE-BANK/PRD/V1/customer
```

La API extrae automáticamente:
- Servicio (endpoint /API/...)
- DNI (8 dígitos + letra)
- Mensaje de error
- Número de línea
