const assert = require('chai').assert;

let rltm = require('./src/index');

let testMessageData = {
    rand: Math.random()
};

let testStateData = {
    rand: Math.random()
};

describe('PubNub', function() {

    let p;
    let s;

    describe('init', function() {

        p = new rltm('pubnub', new Date(), {
            publishKey: 'pub-c-f7d7be90-895a-4b24-bf99-5977c22c66c9',
            subscribeKey: 'sub-c-bd013f24-9a24-11e6-a681-02ee2ddab7fe',
            uuid: new Date(),
            state: testStateData
        });

        it('should create agent object', function() {
            assert.isObject(p, 'was successfully created');
        });

    });

    describe('ready', function() {

        it('should get called when ready', function(done) {

            p.ready(done);

            p.subscribe(function (data) {});

        });

    });

    describe('publish subscribe', function() {

        it('should send and receive message', function(done) {

            p.subscribe(function(data) {
                assert.deepEqual(data, testMessageData, 'input data matches output data');
                done();
            });

            p.publish(testMessageData);

        });

    });

    describe('here now', function() {

        it('at least one user online', function(done) {

            p.hereNow(function(users) {

                assert.isOk(users, 'At least one user online now');
                
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

    describe('init', function() {

        s = new rltm('socketio', 'test-channel', {
            endpoint: 'http://localhost:8000',
            uuid: new Date(),
            state: testStateData
        });
        it('should create agent object', function(done) {
            assert.isObject(s, 'was successfully created');
            done();
        });

    });

    describe('ready', function() {

        it('should get called when ready', function(done) {

            s.ready(function(){
                done();
            });

            s.subscribe(function (data) {});

        });

        it('should get itself as a join event', function(done) {
            
            s.join(function(data) {
                assert.isObject(data, 'event received');
                done();
            });

        });


    });


    describe('publish subscribe', function() {

        it('should send and receive message', function(done) {

            s.subscribe(function (data) {
                assert.deepEqual(data, testMessageData, 'input data matches output data');
                done();
            });

            s.publish(testMessageData);

        });

    });

    describe('here now', function() {

        it('at least one user online', function(done) {

            s.hereNow(function(users) {
                assert.isOk(users, 'At least one user online now');
                done();
            });

        });

    });

});

