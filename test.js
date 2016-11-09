var assert = require('chai').assert;

var rltm = require('./src/index');

describe('PubNub', function() {

    var agent;

    describe('init', function() {

        agent = new rltm('pubnub', 'channel1', {
            publishKey: 'pub-c-f7d7be90-895a-4b24-bf99-5977c22c66c9',
            subscribeKey: 'sub-c-bd013f24-9a24-11e6-a681-02ee2ddab7fe',
            uuid: new Date().getTime()
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

            agent.subscribe(function (data) {
                assert.isTrue(data.works, 'data was received');
                done();
            });

            agent.publish({works: true});

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

        agent = new rltm('socketio', '', 'http://localhost:8000');

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
                assert.isTrue(data.works, 'data was received');
                done();
            });

            agent.publish({works: true});

        });

    });

});

