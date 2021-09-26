#!/bin/sh

cwd=$(pwd)
SCRIPT=$(readlink -f "$0")
cd $(dirname "$SCRIPT")

# check wine
if [ -x "$(command -v wine)" ]; then
  WINE=wine
elif [ -x "$(command -v wine64)" ]; then
  WINE=wine64
else
  echo 'Error: bdsx requires wine. Please install wine first' >&2
  exit $?
fi

# check modules
if [ ! -d "./node_modules" ]; then ./update.sh; fi
if [ $? != 0 ]; then exit $?; fi

if [ ! -f "./bedrock_server/bedrock_server.exe" ]; then ./update.sh; fi
if [ $? != 0 ]; then exit $?; fi

# remove junk
rm ./bedrock_server/bdsx_shell_data.ini >/dev/null 2>/dev/null

# loop begin
while :; do

# shellprepare
npm run -s shellprepare
if [ $? != 1 ]; then break; fi

# launch
cd bedrock_server
WINEDEBUG=fixme-all $WINE ./bedrock_server.exe ..
echo exit=$?>>bdsx_shell_data.ini
cd ..

# loop end
done

cd $cwd
exit $?
