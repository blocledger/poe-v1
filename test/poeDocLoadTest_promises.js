/*
Copyright 2016 BlocLedger

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var crypto = require('crypto');
var Q = require('q');
var request = require('superagent').agent();
// var request = require('request-promise-native');

var baseurl = 'http://localhost:3001';
var url = 'http://localhost:3000/api';
var good = 0;
var bad = 0;

if (process.argv.length < 4) {
  console.log('Usage: node poeDocLoadTest.js <START> <COUNT>');
  console.log(' example for 20 documents starting at 30');
  console.log(' node poeDocLoadTest.js 30 20');
  process.exit();
}
var start = parseInt(process.argv[2], 10);
var count = parseInt(process.argv[3], 10);
console.log('Adding %d documents starting with document%d', count, start);

function sendDoc(hash, fileName, owner) {
  var params = {
    'hash': hash,
    'name': fileName,
    'owner': owner
  };
  return Q.Promise(function(resolve, reject) {
      request
      .post(url + '/Doc')
      .send(params)
      .end(function(err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
  });
};

//Login the test user
return Q.Promise(function(resolve, reject) {
  request
  .post(baseurl + '/addUser')
  .send({userName: 'test@blocledger.com', userPw: 'abc', userPwRepeat: 'abc'})
  .end(function(err, res) {
    if (err) {
      resolve("test user has already been added");
    } else {
      resolve("test user added");
    }
  });
})
.then(function(response) {
  console.log(response);
//Login the test user
  return Q.Promise(function(resolve, reject) {
    request
    .post(baseurl + '/login')
    .send({'userName': 'test@blocledger.com', 'userPw': 'abc', 'remember': false})
    .end(function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res.body);
      }
    });
  });
})
.then(function(response) {
  console.log('User logged in...');
  // create the promises to add documents
  let promises = [];
  for (let i = start; i < start + count; i++) {
    let user = 'user' + (i);

    let docName = 'document' + i;
    let hash = crypto.createHash('sha256');
    hash.update(user + docName);
    let hashDigest = hash.digest('hex');

    console.log(hashDigest, docName, user, i);

    promises.push(sendDoc(hashDigest, docName, user));
  }
  return Q.allSettled(promises);
})
.then(function(results) {
  results.forEach(function(result) {
    if (result.state === 'fulfilled') {
      good++;
      console.log(result.value);
    } else {
      bad++;
      console.log(result.reason);
    }
  })
  console.log('\n\nSucessfull transactions: %d   Failed transactions: %d\n', good, bad);
})
.catch(function(err) {
  console.log('Failed to execute the add doc promises.');
  console.log(err);
});
