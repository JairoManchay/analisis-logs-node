@echo off
echo ============================================
echo LOG ANALYZER API - Curl Commands
echo ============================================
echo.

set BASE_URL=http://localhost:3000
set BATCH_ID=your-batch-id-here

echo [1] Health Check
echo curl -X GET %BASE_URL%/health
echo.
curl -X GET %BASE_URL%/health
echo.

echo ============================================
echo [2] Upload Log File
echo curl -X POST %BASE_URL%/logs/upload -F "file=@your-log-file.log"
echo.
curl -X POST %BASE_URL%/logs/upload -F "file=@sample.log"
echo.

echo ============================================
echo [3] Upload Log Text - Standard Format
echo curl -X POST %BASE_URL%/logs/upload-text ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"content\": \"...\", \"fileName\": \"app.log\"}"
echo.
curl -X POST %BASE_URL%/logs/upload-text ^
  -H "Content-Type: application/json" ^
  -d "{\"content\": \"2024-01-15 10:30:00 ERROR: Database connection failed\n2024-01-15 10:30:01 ERROR: Database connection failed\n2024-01-15 10:30:02 ERROR: NullPointerException at UserService.java:145\n2024-01-15 10:30:03 ERROR: ECONNREFUSED: Connection refused\n2024-01-15 10:30:04 WARN: High memory usage detected\n2024-01-15 10:30:05 ERROR: 500 Internal Server Error\", \"fileName\": \"test.log\"}"
echo.

echo ============================================
echo [3b] Upload Log Text - Android/SURGIR Format
echo curl -X POST %BASE_URL%/logs/upload-text ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"content\": \"...\", \"fileName\": \"surgir-android.log\"}"
echo.
curl -X POST %BASE_URL%/logs/upload-text ^
  -H "Content-Type: application/json" ^
  -d "{\"content\": \"03-23 09:01:36.401 30735 30735 E EEEWW   : 23\n03-23 09:01:36.424 30735 30735 E VERIFY  : false\n03-23 09:01:36.439 30735 30735 E AUTORIZATION: eyJraWQiOi...\n03-23 09:01:36.710 30735 30735 E CASA    : FAM\n03-23 09:01:36.740 30735 26775 E INFO TASAS:: [{\"dataType\":\"CHR\",\"variableName\":\"PDTO\",\"variableValue\":\"INDNEGOCIO\"}]\n03-23 09:01:37.513 30735 26775 E Error Envió: {\"message\":\"No Autorizado\",\"error\":[{\"code\":\"401\",\"message\":\"No Autorizado\"}]}--//--// code : 401\n03-23 09:01:37.711 30735 26792 E Estado de la Red: 42.5\n03-23 09:01:39.549 30735 30735 E fragment_client: Prev date birthday customer -> 24/10/1988\n03-23 09:01:39.552 30735 30735 E AGE     : 1988-10-24 - 2026-03-23\n03-23 09:01:39.552 30735 30735 E AGE     : 37\n03-23 09:04:24.315 30735 30735 E PRODUCTS: [{\"id\":1038,\"margin\":\"45.00\",\"monthly_cost\":\"14,300.00\",\"monthly_sales\":\"26,000.00\",\"name\":\"Venta de comida\"}]\n03-23 09:04:25.139 30735 27047 E ResponseRules: : {\"engineResult\":[{\"ruleName\":\"RuleSelectDesgravamenV4\",\"ruleResult\":[{\"name\":\"SEGURO\",\"value\":\"SEGVIDA,SEGDESPOR\"}]}],\"status\":true}\n03-23 09:09:26.147 30735 30735 E FormProposalViewModel: Error in getDpsDocumentsRequired\n03-23 09:09:26.147 30735 30735 E FormProposalViewModel: java.lang.NullPointerException: Attempt to invoke virtual method 'java.lang.String getDocumnet_number()' on a null object reference\", \"fileName\": \"surgir-android.log\"}"
echo.

echo ============================================
echo [4] Analyze Logs (replace {batchId} with actual ID from upload response)
echo curl -X POST %BASE_URL%/logs/analyze/{batchId}
echo.
curl -X POST %BASE_URL%/logs/analyze/%BATCH_ID%
echo.

echo ============================================
echo [5] Get Top 10 Errors
echo curl "%BASE_URL%/logs/errors/top/{batchId}?n=10"
echo.
curl "%BASE_URL%/logs/errors/top/%BATCH_ID%?n=10"
echo.

echo ============================================
echo [6] Get Top Errors by Category
echo curl "%BASE_URL%/logs/errors/top/{batchId}?n=5&category=NETWORK"
echo.
curl "%BASE_URL%/logs/errors/top/%BATCH_ID%?n=5&category=NETWORK"
echo.

echo ============================================
echo [7] Get Errors by Date Range
echo curl "%BASE_URL%/logs/errors/by-date/{batchId}?startDate=2024-01-01&endDate=2024-12-31"
echo.
curl "%BASE_URL%/logs/errors/by-date/%BATCH_ID%?startDate=2024-01-01&endDate=2024-12-31"
echo.

echo ============================================
echo [8] Get Root Cause Analysis
echo curl "%BASE_URL%/logs/errors/root-cause/{batchId}"
echo.
curl "%BASE_URL%/logs/errors/root-cause/%BATCH_ID%"
echo.

echo ============================================
echo [9] Filter Entries by Category
echo curl "%BASE_URL%/logs/filter/{batchId}?errorCategory=SERVER"
echo.
curl "%BASE_URL%/logs/filter/%BATCH_ID%?errorCategory=SERVER"
echo.

echo ============================================
echo [10] Filter Entries with Pagination
echo curl "%BASE_URL%/logs/filter/{batchId}?page=1&limit=10&severity=HIGH"
echo.
curl "%BASE_URL%/logs/filter/%BATCH_ID%?page=1&limit=10&severity=HIGH"
echo.

echo ============================================
echo [11] Get All Batches
echo curl %BASE_URL%/logs/batches
echo.
curl %BASE_URL%/logs/batches
echo.

echo ============================================
echo DONE!
pause
