
cwd=$(pwd)

SCRIPT=$(readlink -f "$0")
SCRIPTDIR=$(dirname "$SCRIPT")
cd $SCRIPTDIR

if [ ! -d "./node_modules" ] 
then
  if ! command -v npm &> /dev/null
  then
    echo 'Error: bdsx requires npm. Please install node.js first' >&2
    exit 1
  fi
  npm i
fi

if [ ! -d "./bedrock_server" ]
then
  if ! command -v node &> /dev/null
  then
    echo 'Error: bdsx requires node. Please install node.js first' >&2
    exit 1
  fi
  node ./bdsx/bds/installer ./bedrock_server
fi

if ! command -v wine &> /dev/null
then
  WINE=wine
elif ! command -v node64 &> /dev/null
then
  WINE=wine64
else
  echo 'Error: bdsx requires wine. Please install wine first' >&2
  exit 1
fi

export WINEDEBUG=-all
$WINE ./bedrock_server.exe ..
cd $cwd

exit $?