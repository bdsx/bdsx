@echo off
set cwd=%cd%
cd /D "%~dp0"

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: bdsx requires npm. Please install node.js first 1>&2
    cd /D "%cwd%"
    exit /b 1
)
echo ^> npm i
call npm i

set res=%errorlevel%
cd /D "%cwd%"
exit /b %res%
