# API de Análisis de Logs - Documentación de Endpoints

## Iniciar el servidor

```bash
npm run dev
```

El servidor corre en `http://localhost:3000`

---

## Endpoints

### 1. Subir y Analizar un Archivo de Log

**Endpoint:** `POST /logs/upload`

Sube un archivo de log, lo analiza y guarda el resultado en memoria.

**curl:**
```bash
curl -X POST http://localhost:3000/logs/upload \
  -F "log=@logs_prueba.txt"
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid-del-log",
  "filename": "logs_prueba.txt",
  "totalLines": 1318,
  "totalErrors": 268,
  "message": "Log file uploaded and analyzed successfully"
}
```

---

### 2. Analizar un Archivo sin Guardar

**Endpoint:** `POST /logs/analyze`

Analiza un archivo de log sin guardarlo, solo retorna el análisis.

**curl:**
```bash
curl -X POST http://localhost:3000/logs/analyze \
  -F "log=@logs_prueba.txt"
```

**Respuesta exitosa (200):**
```json
{
  "mostFrequentError": { ... },
  "errors": [...],
  "totalErrors": 268,
  "totalLines": 1318,
  "analyzedAt": "2026-04-05T..."
}
```

---

### 3. Obtener Errores Filtrados

**Endpoint:** `GET /logs/errors`

Obtiene errores guardados con múltiples filtros opcionales.

#### Obtener todos los errores
```bash
curl http://localhost:3000/logs/errors
```

#### Filtrar por DNI
Filtra errores que contienen un número de documento específico.
```bash
curl "http://localhost:3000/logs/errors?dni=09011435"
```

#### Filtrar por servicio
Filtra errores por nombre del servicio/tag.
```bash
curl "http://localhost:3000/logs/errors?service=Error"
curl "http://localhost:3000/logs/errors?service=Endpoint"
```

#### Filtrar por ID de log
Filtra errores de un archivo específico.
```bash
curl "http://localhost:3000/logs/errors?logId=2b5d87f4-be86-41f2-9a2b-5eb50b0275b1"
```

#### Filtrar por endpoint (URL de la petición)
Filtra errores que contienen una URL o path específico.
```bash
# Por parte de la URL
curl "http://localhost:3000/logs/errors?endpoint=customer"

# Por URL completa
curl "http://localhost:3000/logs/errors?endpoint=/API/MID-CORE-BANK/PRD/V1/document/engine/download"
```

#### Filtrar por ambiente (QA, PRD, DEV)
Filtra errores por el ambiente donde ocurrió la petición.
```bash
curl "http://localhost:3000/logs/errors?environment=PRD"
curl "http://localhost:3000/logs/errors?environment=QA"
curl "http://localhost:3000/logs/errors?environment=DEV"
```

#### Filtrar por requestId
Filtra errores que comparten un mismo ID de petición (trace ID).
Útil para ver todas las entradas relacionadas con una misma solicitud.
```bash
# Por ID completo
curl "http://localhost:3000/logs/errors?requestId=Endpoint92fede01-4141-441f-a6b4-4eac46942154"

# Por parte del ID
curl "http://localhost:3000/logs/errors?requestId=Endpoint92fede"
```

#### Combinar múltiples filtros
```bash
# Filtrar por DNI + ambiente
curl "http://localhost:3000/logs/errors?dni=09011435&environment=PRD"

# Filtrar por endpoint + ambiente
curl "http://localhost:3000/logs/errors?endpoint=customer&environment=PRD"

# Filtrar por requestId + environment
curl "http://localhost:3000/logs/errors?requestId=Endpoint92fede01&environment=PRD"

# Todos los filtros combinados
curl "http://localhost:3000/logs/errors?dni=09011435&service=Error&endpoint=customer&environment=PRD"
```

---

## Estructura de Respuesta

### ErrorGroup

Cada error en la respuesta tiene la siguiente estructura:

```json
{
  "message": "El objeto no fue encontrado",
  "service": "Error Envió",
  "line": 5,
  "count": 5,
  "dnIs": ["09011435"],
  "errorType": "validation_rule",
  "jsonPayloads": [
    {
      "message": "El objeto no fue encontrado",
      "error": []
    }
  ],
  "reasons": ["El objeto no fue encontrado"],
  "endpoint": "/API/MID-CORE-BANK/PRD/V1/customer/natural-person/by-identification",
  "environment": "PRD",
  "errorCode": "404",
  "requestId": "Endpoint92fede01-4141-441f-a6b4-4eac46942154",
  "relatedEntries": [
    "03-23 10:03:13.960 30735 29079 E Endpoint92fede01-4141-441f-a6b4-4eac46942154: /API/MID-CORE-BANK/PRD/V1/customer/natural-person/by-identification",
    "03-23 10:03:13.960 30735 29079 E Endpoint92fede01-4141-441f-a6b4-4eac46942154: 404"
  ]
}
```

### Campos disponibles:

| Campo | Descripción |
|-------|-------------|
| `message` | Mensaje de error |
| `service` | Nombre del servicio/tag que generó el error |
| `line` | Número de línea en el archivo de log |
| `count` | Cantidad de veces que ocurre el mismo error |
| `dnIs` | Arreglo de DNIs asociados al error |
| `errorType` | Tipo de error: `http_error`, `validation_rule`, `unknown` |
| `jsonPayloads` | JSON de la petición (para errores de validación) |
| `reasons` | Razón del error |
| `endpoint` | URL de la petición API |
| `environment` | Ambiente: `QA`, `PRD`, `DEV` |
| `errorCode` | Código HTTP de error (400, 404, 500, etc.) |
| `requestId` | ID de traceo de la petición |
| `relatedEntries` | Líneas de log relacionadas con el mismo requestId |

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Parámetros inválidos o archivo no subido |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## Notas

- El repositorio es en memoria, los datos se pierden al reiniciar el servidor.
- Los filtros pueden combinarse任意mente.
- La API filtra automáticamente respuestas exitosas (status: true sin errores).
- Para errores con requestId, se agrupan todas las entradas relacionadas.
