
cd /root/bdsx
if [ ! -d ./bdsx ]
then
    git pull upstream master
fi
./bdsx.sh -y
