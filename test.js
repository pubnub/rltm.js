const assert = require('chai').assert;

let rltm = require('./src/index');

let testMessageData = {
    rand: Math.random()
};

let testStateData = {
    rand: Math.random()
};

describe('PubNub', function() {

    let agent;

    describe('init', function() {

        agent = new rltm('pubnub', 'test-channel', {
            publishKey: 'pub-c-f7d7be90-895a-4b24-bf99-5977c22c66c9',
            subscribeKey: 'sub-c-bd013f24-9a24-11e6-a681-02ee2ddab7fe',
            uuid: new Date(),
            state: testStateData
        });

        it('should create agent object', function() {
            assert.isObject(agent, 'was successfully created');
        });

    });

    describe('ready', function() {

        it('should get called when ready', function(done) {

            agent.ready(done);

            agent.subscribe(function (data) {});

        });

    });

    describe('publish subscribe', function() {

        it('should send and receive message', function(done) {

            agent.subscribe(function(data) {
                assert.deepEqual(data, testMessageData, 'input data matches output data');
                done();
            });

            agent.publish(testMessageData);

        });

    });

    describe('here now', function() {

        it('at least one user online', function(done) {

            agent.hereNow(function(users) {
                assert.isAtLeast(users.length, 1, 'At least one user online now');
                done();
            });

        });

    });

});

describe('Socket.io', function() {

    var fork = require('child_process').fork;
    var child = fork('./socket.io-server');

    process.on('exit', function () {
        child.kill();
    });

    var agent;

    describe('init', function() {

        agent = new rltm('socketio', 'test-channel', {
            endpoint: 'http://localhost:8000',
            uuid: new Date(),
            state: testStateData
        });

        it('should create agent object', function(done) {
            assert.isObject(agent, 'was successfully created');
            done();
        });

    });

    describe('ready', function() {

        it('should get called when ready', function(done) {

            agent.ready(function(){
                done();
            });

            agent.subscribe(function (data) {});

        });

    });

    describe('publish subscribe', function() {

        it('should send and receive message', function(done) {

            agent.subscribe(function (data) {
                assert.deepEqual(data, testMessageData, 'input data matches output data');
                done();
            });

            agent.publish(testMessageData);

        });

    });

});

