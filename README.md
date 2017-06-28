# Proof of Existence

This project demonstrates using the Hyperledger Fabric blockchain to store a document
hash so that its existence can be later proved through transaction queries.

## Requirements

* Docker - v1.12 or higher
* Docker Compose - v1.8 or higher
* node - v6.9.5
* Git client
* Windows needs OpenSSL installed into C:/OpenSSL-Win64
  * Goto https://slproweb.com/products/Win32OpenSSL.html and pick the full Win64 package

## Installation

`git clone https://github.com/ghaskins/hyperledger-fabric-alpha2-challenge.git`

`cd hyperledger-fabric-alpha2-challenge/blocledger/poe`
```
npm install -g gulp
npm install -g mocha
npm install -g bower
npm install
```

## Setting up a test blockchain using Docker

A Hyperledger Fabric blockchain network can be run on your local machine
using docker containers.  The configuration and setup files will build a network
that consists of one orderer, two peers, and one CA.

The instructions below assume that you already have docker installed and running.


### Pull images from DockerHub

Pull the fabric chaincode environment image using the x86_64-1.0.0-rc1 tag.
```
docker pull hyperledger/fabric-ccenv:x86_64-1.0.0-rc1
```

### Initial network setup

Run the network setup script which will download the rest of the docker images,
build docker-compose.yaml, create all certificates, and build the genesis block.
```
cd test/fixtures-V1
./network_setup.sh up mychannel
```
To check that the containers are running
```
docker ps
```
To see what version peer you are running
```
docker exec -it peer0.org1.blocledger.com bash
peer --version
exit
```

Go back to the top poe directory and create the channel
```
cd ../..
node createChannel.js
 ```
### Running the application

```
node api.js
```
Once the application is running launch the web interface
using localhost:3000 as the URL.  Once it's up go to
/Admin/Add User/ and add a user such as `test@blocledger.com` with a password
of your choice.

Once the user has been added, login by clicking on `Click to log in` in the
upper right corner of the page.

Next click the `Deploy` button on the Admin page to install the poe chaincode.

After the chaincode has been installed documents can be added and verified.

### Stopping and restarting the network
To stop the containers
```
cd test/fixures-V1
docker-compose stop
```
To start the previously created network
```
cd test/fixures-V1
docker-compose up -d
```

### Deleting the network
Use this procedure to completely delete the network and clean up all of the files
for a fresh start.
```
ctrl-c the node application
cd test/fixures-V1
./network_setup.sh down

rm -r tmp/keyValStore_v1/
```

## Testing
To run both the linter and code style checker run `gulp` with no parameters.

To run testing that will generate transactions and exercise all of the server
capabilities run `gulp test`.
> **Note:**  The chaincode needs to be deployed before running the test.

## Debugging
Turn additional debug prints with
```
DEBUG='poe' HFC_LOGGING='{"debug": "console"}' node api.js
  or
export DEBUG='poe'
export HFC_LOGGING='{"debug": "console"}'
node api.js
```
## Acknowledgement
This project uses the Hyperledger Fabric node
[SDK](https://github.com/hyperledger/fabric-sdk-node) and its examples to connect to
Hyperledger Fabric.
