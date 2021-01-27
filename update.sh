cwd=$(pwd)
SCRIPT=$(readlink -f "$0")
cd $(dirname "$SCRIPT")

if [ -d "./node_modules" ]; then
    echo ""
    echo "> git pull"
    echo ""
    git pull
    if [ $? != 0 ]; then exit $?; fi
fi

echo ""
if ! command -v npm &> /dev/null
then
    echo 'Error: bdsx requires npm. Please install node.js first' >&2
    exit $?
fi
echo "> npm i"
npm i

cd $cwd