#!/bin/bash

# Copyright 2017 BlocLedger

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

# http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
#
# Several lines from bootstrap-1.0.4.sh written by IBM Corp have been used here.
#

export VERSION=1.2.0
export ARCH=$(echo "$(uname -s|tr '[:upper:]' '[:lower:]'|sed 's/mingw64_nt.*/windows/')-$(uname -m | sed 's/x86_64/amd64/g')" | awk '{print tolower($0)}')
MARCH=`uname -m`

app=$PWD
cd test/fixtures-V1/
if [ -f ./${ARCH}/bin/cryptogen ]
then
    if  ./${ARCH}/bin/cryptogen version | grep -q $VERSION
    then
        echo "Fabric binaries already downloaded"
        exit
    fi

    echo "===> Removing old binaries"
    rm -rf ./${ARCH}/bin/
fi
echo "===> Create the working directory"
mkdir -p ./${ARCH}/bin/

echo "===> Downloading platform binaries"
mkdir ./tmp
cd ./tmp
curl https://nexus.hyperledger.org/content/repositories/releases/org/hyperledger/fabric/hyperledger-fabric/${ARCH}-${VERSION}/hyperledger-fabric-${ARCH}-${VERSION}.tar.gz | tar xz

echo "===> Copy the binaries to working folder"
mv bin/configtxgen ../${ARCH}/bin/
mv bin/configtxlator ../${ARCH}/bin/
mv bin/cryptogen ../${ARCH}/bin/

echo "===> Clean up temporary files"
cd ..
rm -rf tmp/
cd "$app"
