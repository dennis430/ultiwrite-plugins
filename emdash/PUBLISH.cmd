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
call npm.cmd run publisher
if errorlevel 1 goto authfailed
echo.
echo This will publish the Ultiwrite EmDash package under ultiwrite.co.
echo Confirm the account shown above. The CLI also checks the manifest publisher.
choice /C YN /N /M "Publish now? [Y/N] "
if errorlevel 2 goto cancelled
call npm.cmd run release
if errorlevel 1 goto failed
echo.
echo The publication command succeeded. Checking registry status:
call npm.cmd run listing
if errorlevel 1 echo Status lookup failed; publication may still be processing. Run npm run listing later.
echo Public directory approval is separate from a successful upload.
pause
exit /b 0
:authfailed
echo Run npm run login in this folder, complete the browser sign-in, then reopen PUBLISH.cmd.
goto failed
:missingnode
echo Node.js was not found. Install Node.js 22.13 or newer and reopen this file.
:failed
echo.
echo STOPPED: a command failed. Publication is not confirmed. Keep the error above for support.
pause
exit /b 1
:cancelled
echo Cancelled. No publication command was run.
pause
exit /b 0
