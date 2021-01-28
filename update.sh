cwd=$(pwd)
SCRIPT=$(readlink -f "$0")
cd $(dirname "$SCRIPT")

echo ""
if ! command -v npm &> /dev/null
then
    echo 'Error: bdsx requires npm. Please install node.js first' >&2
    exit $?
fi
echo "> npm i"
npm i

cd $cwd