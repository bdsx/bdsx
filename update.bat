@echo off
set cwd=%cd%
cd /D "%~dp0"

echo.
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: bdsx requires npm. Please install node.js first 1>&2
    exit /b %errorlevel%
)
echo ^> npm i
call npm i

cd /D "%cwd%"