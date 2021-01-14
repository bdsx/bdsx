@echo off
pushd "%~dp0"

if not exist "node_modules" call :npminstall
if %errorlevel% neq 0 exit /b %errorlevel%

node -v >nul 2>nul
if %errorlevel% neq 0 (
    echo "Error:bdsx requires node. Please install node.js first"
    exit /b %errorlevel%
)
node bdsx\installer .\bedrock_server
if %errorlevel% neq 0 exit /b %errorlevel%

cd bedrock_server
bedrock_server.exe ..
popd %TARGETDIR%
exit /b

:npminstall
npm -v >nul 2>nul
if %errorlevel% neq 0 (
    echo "Error:bdsx requires npm. Please install node.js first"
    exit /b %errorlevel%
) 
npm i
exit /b
