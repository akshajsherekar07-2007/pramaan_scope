@echo off
setlocal
cd /d "%~dp0"
set "PRAMAAN_MODE=pilot"
set "PRAMAAN_DATA_DIR=.pilot-data"
set "PORT=47263"
echo Protected PramaanScope: http://127.0.0.1:47263
echo Create the first reviewer directly in the setup page.
echo Passwords need at least 6 characters. No first-run key or default password is used.
call npm.cmd start
pause
