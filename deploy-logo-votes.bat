@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d C:\Users\shann\Documents\Projects\FriendsOfWADC\site

echo [1/6] Checking Wrangler...
where wrangler >nul 2>&1
if errorlevel 1 (
  echo Wrangler not found. Install with: npm i -g wrangler
  exit /b 1
)

echo [2/6] Validating login...
wrangler whoami >nul 2>&1
if errorlevel 1 (
  echo Not logged in. Opening login...
  wrangler login
  if errorlevel 1 exit /b 1
)

echo [3/6] Listing KV namespaces...
wrangler kv namespace list
if errorlevel 1 exit /b 1

echo.
echo Make sure wrangler.logo-votes.toml has:
echo - account_id  
echo - kv_namespaces binding LOGO_VOTES with correct id
echo - [vars] ALLOWED_ORIGIN set for your live site
echo.
pause

echo [4/6] Deploying Worker...
wrangler deploy --config wrangler.logo-votes.toml
if errorlevel 1 exit /b 1

set ENDPOINT=https://friendsofwadc-logo-votes.shannonborntrager.workers.dev
set ORIGIN=https://friendsofwadc.org

echo [5/6] Testing GET endpoint...
curl "%ENDPOINT%?limit=5"
if errorlevel 1 exit /b 1

echo.
echo [6/6] Testing POST vote...
curl -X POST "%ENDPOINT%" ^
  -H "Content-Type: application/json" ^
  -H "Origin: %ORIGIN%" ^
  -d "{\"picks\":[\"logo1\",\"logo2\",\"logo3\"],\"voterName\":\"CLI Test\",\"comment\":\"deploy test\",\"submittedAt\":\"2026-02-14T12:00:00.000Z\"}"
if errorlevel 1 exit /b 1

echo.
echo Done. If POST succeeded, open logoResults.html locally (or move it into .\public to host it) to confirm it appears.
echo You can also verify KV keys with:
echo wrangler kv key list --binding LOGO_VOTES --prefix "vote:"
endlocal
