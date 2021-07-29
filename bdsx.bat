@echo off
set cwd=%cd%
cd /D "%~dp0"

if not exist "node_modules" call update.bat
if %errorlevel% neq 0 exit /b %errorlevel%

if not exist "bedrock_server" call update.bat
if %errorlevel% neq 0 exit /b %errorlevel%

call npm run -s build > nul 2>&1

cd bedrock_server
bedrock_server.exe ..

cd /D "%cwd%"
exit /b