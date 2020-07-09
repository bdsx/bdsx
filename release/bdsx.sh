
if ! [ -x "$(command -v wine)" ]; then
  echo 'Error: It requires wine. Please install wine first' >&2
  exit 1
fi

SCRIPT=$(readlink -f "$0")
SCRIPTDIR=$(dirname "$SCRIPT")
"$SCRIPTDIR"/bin/bdsx-cli-linux $@
if [ $? != 2 ]; then exit $?; fi
TARGET=$(pwd)/bdsx

pushd ~/.bds
wine ~/.bds/bedrock_server.exe "$TARGET"
popd

exit $?