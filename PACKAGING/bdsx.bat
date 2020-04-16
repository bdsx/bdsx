@echo off

REM injector.exe (dll_path) (exe_path) [exe_arguments...]

REM bdsx.dll will parse [exe_arguments...]
REM
REM --mutex (name)  create a mutex to prevent multiple instance
REM                 It will wait the previous process until closing
REM					Mutex name is BDSX_(name)
REM
REM -M (path)       module (path)
REM
REM --pipe-socket (host) (port) (firstline)	BDSX will pipe IO to the host
REM											when it connected, it will send (firstline) with NewLine(\n) character

cd server
..\bin\injector.exe ..\bin\bdsx.dll bedrock_server.exe -M ..\bdsx --mutex main
if %errorlevel% NEQ 0 ( pause )
