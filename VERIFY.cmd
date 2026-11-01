@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 or later, then run this again.
  pause
  exit /b 1
)
node scripts\verify-distribution.mjs
if errorlevel 1 (
  echo Verification failed. Read distribution\verification. Nothing was submitted.
  pause
  exit /b 1
)
echo Prepared packs are in dist\distribution. Read START_HERE.md. Nothing was submitted.
echo Native platform checks, account approvals and authenticated host tests are still required.
pause
