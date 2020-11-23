
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
TARGETDIR=$(pwd)/bdsx
export WINEDEBUG=-all
pushd ~/.bds
$WINE ~/.bds/bedrock_server.exe "$TARGETDIR"
popd

exit $?