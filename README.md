# Proof of Existence

This project demonstrates using the Hyperledger Composer to store a document
hash so that its existence can be later proved through transaction queries.

## Requirements

* Docker - v1.12 or higher
* Docker Compose - v1.8 or higher
* node - v6.9.5
* Git client
* Windows is not supported by Composer

## Installation

`git clone https://github.com/blocledger/poe-alpha2.git`

`cd poe-alpah2`
```
npm install -g gulp
npm install -g mocha
npm install -g bower
npm install
```

## Setting up a test blockchain using Composer

Follow the instructions for installing and starting the Hyperledger Composer development network found at:
`https://hyperledger.github.io/composer/installing/development-tools.html`

### Deploy the POE Business Network Archive (BNA) file to the test network

Make sure you are currenting in the POE directory 
```
cd ./poe-alpha2
```
Use composer to deplay the POE bna file.
```
composer network deploy -a poe-network.bna -p hlfv1 -i PeerAdmin -s randomString
```

Start the REST server the test network
```
composer-rest-server -p hlfv1 -n poe-network -i admin -s adminpw -N never
 ```
### Running the application

```
node api.js
```
Once the application is running launch the web interface
using localhost:3001 as the URL.  Once it's up go to
/Admin/Add User/ and add a user such as `test@blocledger.com` with a password
of your choice.

Once the user has been added, login by clicking on `Click to log in` in the
upper right corner of the page.

### Stopping and restarting the network
Follow the instructions provided in the Composer documentation sumerized here
```
cd fabric-tools
./stopFabric.sh
```
To start the previously created network
```
cd fabric-tools
./startFabric.sh
```

### Deleting the network
Use this procedure to completely delete the network and clean up all of the files
for a fresh start.
```
cd fabric-tools
./stopFabric.sh
./teardownFabric.sh
```
### Create a new network
After the old network has been stopped and deleted and new can be started.
```
cd fabric-tools
./startFabric.sh
./createComposerProfile.sh
```
## Testing
To run both the linter and code style checker run `gulp` with no parameters.

To run testing that will generate transactions and exercise all of the server
capabilities run `gulp test`.

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
This project uses the Hyperledger Composer and its examples.
