@echo off
pushd "%~dp0"

if not exist "node_modules" (
    WHERE npm
    IF %errorlevel% neq 0 (
        echo "Error:bdsx requires npm. Please install node.js first"
        exit /b %errorlevel%
    ) 
    npm i
)
if not exist "bedrock_server\bedrock_server.exe" (
    WHERE node
    IF %errorlevel% neq 0 (
        echo "Error:bdsx requires node. Please install node.js first"
        exit /b %errorlevel%
    )
    node bdsx\bds\installer .\bedrock_server
)
cd bedrock_server
bedrock_server.exe ..
popd %TARGETDIR%
