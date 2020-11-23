
if [ -x "$(command -v wine)" ]; then
  WINE=wine
elif [ -x "$(command -v wine64)" ]; then
  WINE=wine64
else
  echo 'Error: It requires wine. Please install wine first' >&2
  exit 1
fi

SCRIPT=$(readlink -f "$0")
SCRIPTDIR=$(dirname "$SCRIPT")
"$SCRIPTDIR"/bin/bdsx-cli-linux $@
if [ $? != 2 ]; then exit $?; fi

cwd=$(pwd)
TARGETDIR=$cwd/bdsx
export WINEDEBUG=-all

cd ~/.bds
$WINE ~/.bds/bedrock_server.exe "$TARGETDIR"
cd $cwd

exit $?