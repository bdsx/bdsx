
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
  npm run build
fi

if [ ! -d "./bedrock_server" ]
then
  if ! command -v node &> /dev/null
  then
    echo 'Error: bdsx requires node. Please install node.js first' >&2
    exit $?
  fi
  node ./bdsx/installer ./bedrock_server
  if [ $? != 0 ]; then exit 0; fi
fi

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

export WINEDEBUG=-all
$WINE ./bedrock_server.exe ..
cd $cwd

exit $?