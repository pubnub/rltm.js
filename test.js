const assert = require('chai').assert;

const fork = require('child_process').fork;
const child = fork('./socket.io-server');
const async = require('async');

process.on('exit', function () {
    child.kill();
});

const rltm = require('./src/index');

const testMessageData = {
    rand: Math.random()
};

const testStateData = {
    rand: Math.random()
};

const testNewStateData = {
    rand: Math.random()
};

const connectionInput = process.env.CLIENT || 'pubnub';

const connections = {
    pubnub: rltm({
        service: 'pubnub', 
        config: {
            publishKey: 'demo',
            subscribeKey: 'demo',
            uuid: new Date().getTime()
        }
    }),
    socketio: rltm({
        service: 'socketio', 
        config: {
            endpoint: 'http://localhost:9000',
            uuid: new Date().getTime()
        }
    })    
};

const connection = connections[connectionInput];

describe(connection.service, function() {

    describe('init', function() {

        it('should create connection object', function() {
            assert.isObject(connection, 'was successfully created');
        });

    });

    describe('ready', function() {

        it('should get called when ready', function(done) {
            
            room = connection.join(new Date().getTime(), testStateData);

            room.ready(() => {
                done();
            });

        });

        it('should get itself as a join event', function(done) {

            room = connection.join(new Date().getTime(), testStateData);

            room.on('join', function(uuid, state) {
                assert.isOk(uuid, 'uuid is set');
                done();
            });

        });

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

            room.hereNow().then(function(users) {

                assert.isOk(users, 'At least one user online now');
                done();

            }, function(err) {
                assert.fail();
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

            room.setState(testNewStateData).then(function() {
                // it worked
            }, function(err) {
                assert.fail();
            });

        });

    });

    describe('unsubscribe', function() {

        it('should disconnect', function(done) {
            room.unsubscribe().then(function(){
                done();
            });
        });

    });

    describe('history', function() {

        it('should recall history', function(done) {

            this.timeout(8000);

            setTimeout(function() {

                room.history().then(function(history) {

                    assert.isOk(history[0]);
                    assert.deepEqual(history[0].data, testMessageData, 'latest message is correct');
                    assert.isAbove(history.length, 0, 'at least one messages received');

                    done();

                }, function() {
                    assert.fail();
                });

            }, 1000);

        });

    });

    describe('many rooms', function() {

        it('should keep rooms separate', function(done) {

            this.timeout(6000);

            async.parallel({
                one: function(callback) {
                    
                    let input = {room: 1};
                    let room1 = connection.join('room-1');

                    room1.on('message', function(uuid, output) {
                        assert.deepEqual(input, output);
                        callback();
                    });

                    room1.publish(input);

                },
                two: function(callback) {

                    let input = {room: 2};
                    let room2 = connection.join('room-2');

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

