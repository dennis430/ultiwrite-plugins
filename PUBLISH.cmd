@echo off
setlocal
cd /d "%~dp0"
if errorlevel 1 exit /b %errorlevel%
node "%~dp0scripts\publish-cli.mjs" %*
exit /b %errorlevel%
