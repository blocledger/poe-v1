app=$PWD
cd test/fixtures-V1/
./network_setup.sh down
rm -r ../../tmp/keyValStore_v1/*
cp $app/reboot/*.js $app/
./network_setup.sh up mychannel
cd $app
node createChannel.js
rm nohup.out
