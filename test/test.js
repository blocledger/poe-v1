var assert = require('chai').assert;
var request = require('superagent').agent();
var util = require('../util.js');
var url = 'http://localhost:3000';

var testTimeout = 15000;  //wait time in milliseconds before failing a test

// dummy hash values for testing
var hash1 = 'hash1-1234567890123456789012345678901234567890123456789012345678'
var hash2 = 'hash2-1234567890123456789012345678901234567890123456789012345678'

//testing the Application REST interface that uses the node SDK
describe('Application REST interface', function() {

  describe('login user', function() {
    it('should login the test user', function(done) {
      request
      .post(url + '/login')
      .send({'userName': 'test@blocledger.com', 'userPw': 'abc', 'remember': false})
      .end(function(err, res) {
        assert.isNull(err);
        //console.log(err.response.error);
        assert.equal(res.status, 200, 'should receive a 200 status');
        done();
      })
    });
  });

  describe('/addDoc', function() {
    it('should add a document to the blockchain', function(done) {
      this.timeout(testTimeout);
      request
      .post(url + '/addDoc')
      .send({hash: hash1, name: 'dummyFile1.txt', owner: 'Alice', hashType: 'sha256'})
      .end(function(err, res) {
      assert.isNull(err);
      console.log(res.body);
      assert.isArray(res.body);
      assert.property(res.body[0], 'status', 'reply should have result');
      assert.isString(res.body[0].status, 'the status should be a string');
      assert.equal(res.body[0].status, 'SUCCESS', 'the status should be a SUCCESS');
      done();
      });
    });
    it('should add a second document', function(done) {
      this.timeout(testTimeout);
      request
      .post(url + '/addDoc')
      .send({hash: hash2, name: 'dummyFile2.txt', owner: 'Bob', hashType: 'sha256'})
      .end(function(err, res) {
      assert.isNull(err);
      //console.log(res.body);
      assert.isArray(res.body);
      assert.property(res.body[0], 'status', 'reply should have result');
      assert.isString(res.body[0].status, 'the status should be a string');
      assert.equal(res.body[0].status, 'SUCCESS', 'the status should be a SUCCESS');
      done();
      });
    });
  });
  describe('/listDoc', function(){
    it('should return a list of users', function(done) {
      this.timeout(testTimeout);
      request
      .get(url + '/listDoc')
      .accept('application/json')
      .end(function(err, res) {
        assert.isNull(err);
        // console.log(res.body);
        assert.property(res.body, hash1, 'hash1 should be in the list');
        var doc = JSON.parse(res.body[hash1]);
        assert.property(doc, 'Owner', 'Document owner should be present');
        assert.equal(doc.Owner, 'Alice', 'the owner should be Alice');
        done();
      });
    });
  });
  describe('/transferDoc', function() {
    it('should transfer doc from Alice to Bob', function(done) {
      this.timeout(testTimeout);
      request
      .post(url + '/editDoc')
      .send({hash: hash1, owner: 'Bob'})
      .end(function(err, res) {
        assert.isNull(err);
        //console.log(res.body);
        assert.isArray(res.body);
        assert.property(res.body[0], 'status', 'reply should have result');
        assert.isString(res.body[0].status, 'the status should be a string');
        assert.equal(res.body[0].status, 'SUCCESS', 'the status should be a SUCCESS');
        done();
      });
    });
    it('Bob should be the new owner', function(done) {
      this.timeout(testTimeout);
      request
      .get(url + '/listDoc')
      .end(function(err, res) {
        assert.isNull(err);
        // console.log(res.body);
        assert.property(res.body, hash1, 'hash1 should be in the list');
        var doc = JSON.parse(res.body[hash1]);
        assert.property(doc, 'Owner', 'Document owner should be present');
        assert.equal(doc.Owner, 'Bob', 'the owner should be Bob');
        done();
      });
    });
  });

  describe('/verifyDoc', function() {
    it('should be able to verify the document exists', function(done) {
      this.timeout(testTimeout);
      request
      .get(url + '/verifyDoc/' + hash1)
      .end(function(err, res) {
        assert.isNull(err);
        assert.equal(res.status, 200, 'should receive a 200 status');
        // console.log(res.body);
        assert.property(res.body, 'Hash', 'response should have a Hash');
        assert.equal(res.body.Hash, hash1, 'the hash should be the same as the input hash');
        done();
      });
    });
    it('should report an error for an unknown hash value', function(done) {
      this.timeout(testTimeout);
      request
      .get(url + '/verifyDoc/' + 'abcd1234')
      .end(function(err, res) {
        // console.log(res);
        assert.isNotNull(err);
        assert.equal(res.status, 500, 'should receive a 500 status');
        assert.property(res, 'text', 'response should have a text field');
        assert.equal(res.text, 'Document not found', 'should return document not found');
        done();
      });
    });

  });
  describe('/delDoc', function() {
    it('should delete a test document', function(done) {
      this.timeout(testTimeout);
      request
      .post(url + '/delDoc')
      .send({hash: hash1})
      .end(function(err, res) {
      assert.isNull(err);
      //console.log(res.body);
      assert.isArray(res.body);
      assert.property(res.body[0], 'status', 'reply should have result');
      assert.isString(res.body[0].status, 'the status should be a string');
      assert.equal(res.body[0].status, 'SUCCESS', 'the status should be a SUCCESS');
      done();
      });
    });
    it('should delete second test document', function(done) {
      this.timeout(testTimeout);
      request
      .post(url + '/delDoc')
      .send({hash: hash2})
      .end(function(err, res) {
      assert.isNull(err);
      //console.log(res.body);
      assert.isArray(res.body);
      assert.property(res.body[0], 'status', 'reply should have result');
      assert.isString(res.body[0].status, 'the status should be a string');
      assert.equal(res.body[0].status, 'SUCCESS', 'the status should be a SUCCESS');
      done();
      });
    });
    it('both test documents should be gone', function(done) {
      this.timeout(testTimeout);
      request
      .get(url + '/listDoc')
      .end(function(err, res) {
        assert.isNull(err);
        //console.log(res.body);
        assert.notProperty(res.body, hash1, 'hash1 should not be in the list');
        assert.notProperty(res.body, hash2, 'hash2 should be not in the list');
        done();
      });
    });
  });
});

//Test adding a new user
describe('Add new user test:', function() {
  describe('/addUser POST', function() {
    it('should return success from the POST call', function(done) {
      this.timeout(testTimeout);
      request
      .post(url + '/addUser')
      .send({userName: 'user1.test@blocledger.com'})
      .end(function(err, res) {
        assert.isNull(err);
        // console.log(res.body);
        assert.property(res.body, 'result', 'reply should have result');
        assert.isString(res.body.result, 'the result should be a string');
        done();
      });
    });
  });
  describe('/activeUser POST', function() {
    it('should set the new user as the active user', function(done) {
      this.timeout(testTimeout);
      request
      .post(url + '/activeUser')
      .send({user: 'user1.test@blocledger.com'})
      .end(function(err, res) {
        assert.isNull(err);
        // console.log(res.body);
        assert.property(res.body, 'result', 'reply should have result');
        assert.isString(res.body.result, 'the result should be a string');
        done();
      });
    });
  });
  describe('/activeUser GET', function() {
    it('should return the new user', function(done) {
      this.timeout(testTimeout);
      request
      .get(url + '/activeUser')
      .end(function(err, res) {
        // console.log(res);
        assert.isNull(err);
        assert.equal(res.status, 200, 'should receive a 200 status');
        // console.log(res.body);
        assert.isString(res.body, 'the return should be a string');
        assert.equal(res.body, 'user1.test@blocledger.com', 'the returned user should be user1.test@blocledger.com');
        done();
      });
    });
  });
});
