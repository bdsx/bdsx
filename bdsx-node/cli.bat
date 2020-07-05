:<<"::CMDLITERAL"
@ECHO OFF
GOTO :CMDSCRIPT
::CMDLITERAL

if ! [ -x "$(command -v wine)" ]; then
  echo 'Error: It requires wine. Please install wine first' >&2
  exit 1
fi

SCRIPT=$(readlink -f "$0")
BASEDIR=$(dirname "$SCRIPT")
node "$BASEDIR/cli.js" $@
if [ $? != 2 ]; then exit $?; fi

TARGETDIR=$(pwd)
pushd ~\.bds
wine ~\.bds\bedrock_server.exe --dir "$(TARGETDIR)" $@
popd

exit $?
:CMDSCRIPT

node "%~dp0cli.js" %*
if "%errorlevel%" neq "2" goto :eof

set TARGETDIR=%cd%
pushd "%UserProfile%\.bds"
%UserProfile%\.bds\bedrock_server.exe --dir "%TARGETDIR%" %*
popd
