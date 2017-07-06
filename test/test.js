var assert = require('chai').assert;
var request = require('superagent').agent();
var baseurl = 'http://localhost:3001';
var url = 'http://localhost:3000/api';

var testTimeout = 15000;  //wait time in milliseconds before failing a test

// dummy hash values for testing
var hash1 = 'hash1-1234567890123456789012345678901234567890123456789012345678'
var hash2 = 'hash2-1234567890123456789012345678901234567890123456789012345678'

//Test adding a new user
describe('Add new user test:', function() {
  describe('/addUser POST', function() {
    it('should return success from the POST call', function(done) {
      this.timeout(testTimeout);
      request
      .post(baseurl + '/addUser')
      .send({userName: 'test@blocledger.com', userPw: 'abc', userPwRepeat: 'abc', userType: 'user'})
      .end(function(err, res) {
        if (err) {
          // console.log(err);
          assert.equal(res.status, 500, 'should receive a 500 status');
          assert.equal(res.text, 'User name is already in use');
        } else {
          // console.log(res);
          assert.property(res, 'status', 'reply should have status');
          assert.equal(res.status, 200, 'should receive a 200 status');
        }
        done();
      });
    });
  });
});

//testing the Application REST interface that uses the node SDK
describe('Application REST interface', function() {
  describe('login user', function() {
    it('should login the test user', function(done) {
      request
      .post(baseurl + '/login')
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
      .post(url + '/Doc')
      .send({hash: hash1, name: 'dummyFile1.txt', owner: 'Alice'})
      .end(function(err, res) {
      // console.log(err);
      assert.isNull(err);
      // console.log(res.body);
      assert.isObject(res.body);
      assert.property(res.body, 'hash', 'reply should have a hash member');
      assert.isString(res.body.hash, 'the hash should be a string');
      assert.equal(res.body.hash, hash1, 'the hash value should equal the input hash');
      done();
      });
    });
    it('should add a second document', function(done) {
      this.timeout(testTimeout);
      request
      .post(url + '/Doc')
      .send({hash: hash2, name: 'dummyFile2.txt', owner: 'Bob'})
      .end(function(err, res) {
      assert.isNull(err);
      //console.log(res.body);
      assert.isObject(res.body);
      assert.property(res.body, 'name', 'reply should have a filename');
      assert.isString(res.body.name, 'and the filename should be a string');
      assert.equal(res.body.name, 'dummyFile2.txt', 'and the filename should be dummyFile2.txt');
      done();
      });
    });
  });
  describe('/listDoc', function(){
    it('should return a list of documents', function(done) {
      this.timeout(testTimeout);
      request
      .get(url + '/Doc')
      .accept('application/json')
      .end(function(err, res) {
        assert.isNull(err);
        // console.log(res.body);
        assert.isArray(res.body, 'GET /Doc should return an array');
        var doc = res.body.find(function(d) {
          return d.hash == hash2;
        });
        // console.log(doc);
        assert.property(doc, 'owner', 'Document owner should be present');
        assert.match(doc.owner, /Bob/, 'and the owner should be Bob');
        done();
      });
    });
  });
  describe('/transferDoc', function() {
    it('should transfer doc from Alice to Bob', function(done) {
      this.timeout(testTimeout);
      request
      .post(url + '/DocTransfer')
      .send({doc: hash1, newOwner: 'Bob'})
      .end(function(err, res) {
        // console.log(err);
        assert.isNull(err);
        // console.log(res.body);
        assert.isObject(res.body, 'and /DocTransfer should return an object');
        assert.property(res.body, 'transactionId', 'reply should have a transactionId');
        assert.isString(res.body.transactionId, 'and the transactionId should be a string');
        assert.isAtLeast(res.body.transactionId.length, 10, 'and the transactionId should be greater than 10 characters');
        done();
      });
    });
    it('Bob should be the new owner', function(done) {
      this.timeout(testTimeout);
      request
      .get(url + '/Doc')
      .end(function(err, res) {
        assert.isNull(err);
        // console.log(res.body);
        assert.isArray(res.body, 'GET /Doc should return an array');
        var doc = res.body.find(function(d) {
          return d.hash == hash1;
        });
        // console.log(doc);
        assert.property(doc, 'owner', 'Document owner should be present');
        assert.match(doc.owner, /Bob/, 'and the owner should be Bob');
        done();
      });
    });
  });

  describe('/verifyDoc', function() {
    it('should be able to verify the document exists', function(done) {
      this.timeout(testTimeout);
      request
      .get(url + '/Doc/' + hash1)
      .end(function(err, res) {
        assert.isNull(err);
        assert.equal(res.status, 200, 'should receive a 200 status');
        // console.log(res.body);
        assert.property(res.body, 'hash', 'response should have a Hash');
        assert.equal(res.body.hash, hash1, 'the hash should be the same as the input hash');
        done();
      });
    });
    it('should report an error for an unknown hash value', function(done) {
      this.timeout(testTimeout);
      request
      .get(url + '/Doc/' + 'abcd1234')
      .end(function(err, res) {
        // console.log(res.body);
        assert.isNotNull(err);
        assert.equal(res.status, 404, 'should receive a 404 status');
        assert.property(res.body, 'error', 'response should have a Error field');
        done();
      });
    });

  });
  describe('/delDoc', function() {
    it('should delete a test document', function(done) {
      this.timeout(testTimeout);
      request
      .delete(url + '/Doc/' + hash1)
      .end(function(err, res) {
      assert.isNull(err);
      // console.log(res);
      assert.equal(res.status, 204, 'should receive a 204 status');
      done();
      });
    });
    it('should delete second test document', function(done) {
      this.timeout(testTimeout);
      request
      .delete(url + '/Doc/' + hash2)
      .end(function(err, res) {
      assert.isNull(err);
      // console.log(res.body);
      assert.equal(res.status, 204, 'should receive a 204 status');
      done();
      });
    });
    it('both test documents should be gone', function(done) {
      this.timeout(testTimeout);
      request
      .get(url + '/Doc')
      .end(function(err, res) {
        assert.isNull(err);
        //console.log(res.body);
        assert.isArray(res.body, 'GET /Doc should return an array');
        var doc = res.body.find(function(d) {
          return (d.hash == hash1 || d.hash == hash2);
        });
        assert.isUndefined(doc, 'Documents should be deleted');
        done();
      });
    });
  });
});
