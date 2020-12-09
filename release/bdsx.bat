
@%~dp0\bin\bdsx-win %*
@if "%errorlevel%" neq "2" goto :eof

@set TARGETDIR=%cd%
cd /D "%UserProfile%\.bds"
@"%UserProfile%\.bds\bedrock_server.exe" "%TARGETDIR%\bdsx"
cd /D %TARGETDIR%
