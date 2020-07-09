:<<"::CMDLITERAL"
@ECHO OFF

setlocal

node "%~dp0cli.js" %*
if "%errorlevel%" neq "2" goto :eof

FOR /F "tokens=* USEBACKQ" %%F IN (`npm root -g`) DO (
SET GLOBAL_NODE_PATH=%%F
)

if "%NODE_PATH%" == "" (
	set NODE_PATH=%GLOBAL_NODE_PATH%
) else (
	set NODE_PATH=%NODE_PATH%;%GLOBAL_NODE_PATH%
)

set TARGETDIR=%cd%
pushd "%UserProfile%\.bds"
%UserProfile%\.bds\bedrock_server.exe --dir "%TARGETDIR%" %*
popd

GOTO :eof
::CMDLITERAL

if ! [ -x "$(command -v wine)" ]; then
  echo 'Error: It requires wine. Please install wine first' >&2
  exit 1
fi

SCRIPT=$(readlink -f "$0")
BASEDIR=$(dirname "$SCRIPT")

node "$BASEDIR/cli.js" $@
if [ $? != 2 ]; then exit $?; fi

GLOBAL_NODE_PATH=$(npm root -g)
if ["$NODE_PATH" == ""]; then
	export NODE_PATH=$GLOBAL_NODE_PATH
else
	export NODE_PATH=$NODE_PATH:$GLOBAL_NODE_PATH
fi
TARGETDIR=$(pwd)
pushd ~/.bds
wine ~/.bds/bedrock_server.exe --dir "$TARGETDIR" $@
popd

exit $?
