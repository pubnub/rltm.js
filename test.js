const assert = require('chai').assert;

const fork = require('child_process').fork;
const child = fork('./socket.io-server');
const async = require('async');

process.on('exit', function () {
    child.kill();
});

let rltm = require('./src/index');

let testMessageData = {
    rand: Math.random()
};

let testStateData = {
    rand: Math.random()
};

let testNewStateData = {
    rand: Math.random()
};

var agentInput = process.env.AGENT || 'pubnub';

var agents = {
    pubnub: rltm('pubnub', {
        publishKey: 'demo',
        subscribeKey: 'demo',
        uuid: new Date().getTime()
    }),
    socketio: rltm('socketio', {
        endpoint: 'http://localhost:9000',
        uuid: new Date().getTime()
    })    
};

var agent = agents[agentInput];

describe(agent.service, function() {

    describe('init', function() {

        it('should create agent object', function() {
            assert.isObject(agent, 'was successfully created');
        });

    });

    describe('ready', function() {

        it('should get called when ready', function(done) {
            room.on('ready', function(){
                done();
            });
        });

        it('should get itself as a join event', function(done) {

            room.on('join', function(uuid, state) {
                assert.isOk(uuid, 'uuid is set');
                done();
            });

        });
        
        room = agent.join(new Date().getTime(), testStateData);

    });

    describe('publish subscribe', function() {

        it('should send and receive message', function(done) {

            room.on('message', function(uuid, message){
                assert.deepEqual(message, testMessageData);
                done();
            });

            room.publish(testMessageData);

        });

    });

    describe('here now', function() {

        it('at least one user online', function(done) {

            room.hereNow(function(users) {

                assert.isOk(users, 'At least one user online now');
                
                done();

            });

        });

    });

    describe('state', function() {

        it('should set state', function(done) {

            room.on('state', function(uuid, state) {
                assert.isOk(uuid, 'uuid supplied');
                assert.isObject(state, 'state is object');
                done();
            });

            room.setState(testNewStateData);

        });

    });

    describe('unsubscribe', function() {

        it('should disconnect', function() {
            room.unsubscribe();
        });

    });

    describe('history', function() {

        it('should recall history', function(done) {

            this.timeout(8000);

            setTimeout(function() {
                room.history(function(history) {

                    assert.isOk(history[0]);
                    assert.deepEqual(history[0].data, testMessageData, 'latest message is correct');
                    assert.isAbove(history.length, 0, 'at least one messages received');

                    done();

                });
            }, 1000);

        });

    });

    describe('many rooms', function() {

        it('should keep rooms seperate', function(done) {

            async.parallel({
                one: function(callback) {
                    
                    let input = {room: 1};

                    let room1 = agent.join('room-1');

                    room1.on('message', function(uuid, output) {
                        assert.deepEqual(input, output);
                        callback();
                    });

                    room1.publish(input);

                },
                two: function(callback) {

                    let input = {room: 2};

                    let room2 = agent.join('room-2');

                    room2.on('message', function(uuid, output) {
                        assert.deepEqual(input, output);
                        callback();
                    });

                    room2.publish(input);
                }
            }, function(err, results) {

                done();

            });

        });

    });

});

