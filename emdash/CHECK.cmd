@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto missingnode
node scripts\check-node.mjs
if errorlevel 1 goto failed
if exist package-lock.json (call npm.cmd ci --no-audit --no-fund) else (call npm.cmd install --no-audit --no-fund)
if errorlevel 1 goto failed
call npm.cmd run verify
if errorlevel 1 goto failed
echo.
echo CHECKS PASSED. Nothing was published.
pause
exit /b 0
:missingnode
echo Node.js was not found. Install Node.js 22.13 or newer and reopen this file.
:failed
echo.
echo STOPPED: a check failed. Nothing was published. Keep the error above for support.
pause
exit /b 1
