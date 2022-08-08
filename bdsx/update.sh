#!/bin/sh

cwd=$(pwd)
SCRIPT=$(readlink -f "$0")
cd $(dirname "$SCRIPT")

if ! [ -x "$(command -v npm)" ]; then
    echo 'Error: bdsx requires npm. Please install node.js first' >&2
    exit 0
fi
echo "> npm i --unsafe-perm"
npm i --unsafe-perm

cd $cwd
