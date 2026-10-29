@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo Dependencies are missing. Run npm ci in this folder first.
  pause
  exit /b 1
)
if not exist dist\index.html (
  call npm run build
  if errorlevel 1 exit /b 1
)
echo.
echo Open http://127.0.0.1:47261 in your browser.
echo Keep this window open. Press Ctrl+C to stop PramaanScope.
echo.
call npm start
