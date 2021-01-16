
cwd=$(pwd)

SCRIPT=$(readlink -f "$0")
SCRIPTDIR=$(dirname "$SCRIPT")
cd $SCRIPTDIR

if [ ! -d "./node_modules" ] 
then
  if ! command -v npm &> /dev/null
  then
    echo 'Error: bdsx requires npm. Please install node.js first' >&2
    exit $?
  fi
  npm i
fi

if ! command -v node &> /dev/null
then
  echo 'Error: bdsx requires node. Please install node.js first' >&2
  exit $?
fi

npm run install_bds -- $@
if [ $? != 0 ]; then exit $?; fi

if ! command -v wine &> /dev/null
then
  WINE=wine
elif ! command -v node64 &> /dev/null
then
  WINE=wine64
else
  echo 'Error: bdsx requires wine. Please install wine first' >&2
  exit $?
fi

npm run build
if [ $? != 0 ]; then exit $?; fi

cd bedrock_server
export WINEDEBUG=-all
$WINE ./bedrock_server.exe ..
cd $cwd

exit $?