
@%~dp0\bin\bdsx-cli-win %*
@if "%errorlevel%" neq "2" goto :eof

@set TARGET="%cd%\bdsx"
@pushd "%UserProfile%\.bds" 
@"%UserProfile%\.bds\bedrock_server.exe" "%TARGET%"
@popd
