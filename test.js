const assert = require('chai').assert;

var fork = require('child_process').fork;
var child = fork('./socket.io-server');

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

var agents = [
    rltm('pubnub', new Date(), {
        publishKey: 'pub-c-191d5212-dd99-4f2e-a8cf-fb63775232bc',
        subscribeKey: 'sub-c-aa1d9fe8-a85b-11e6-a397-02ee2ddab7fe',
        uuid: new Date(),
        state: testStateData
    }),
    rltm('socketio', {
        endpoint: 'http://localhost:8000',
        uuid: new Date(),
        state: testStateData
    })    
];

let agent = null;
let socket = null;
agents.forEach(function(agent){

    describe(agent.service, function() {

        describe('init', function() {

            it('should create agent object', function() {
                assert.isObject(agent, 'was successfully created');
            });

        });

        describe('ready', function() {
            
            it('should get called when ready', function(done) {
                socket.ready(function(){
                    done();
                });

            });

            it('should get itself as a join event', function(done) {

                socket.join(function(uuid, state) {

                    assert.isOk(uuid, 'uuid is set');
                    done();

                });

            });

            socket = agent.subscribe('test-channel');

        });

        describe('publish subscribe', function() {

            it('should send and receive message', function(done) {

                socket.message(function(message){
                    done();
                });

                socket.publish(testMessageData);

            });

        });

        describe('here now', function() {

            it('at least one user online', function(done) {

                socket.hereNow(function(users) {

                    assert.isOk(users, 'At least one user online now');
                    
                    done();

                });

            });

        });

        describe('state', function() {

            it('should set state', function(done) {

                socket.state(function(uuid, state) {
                    assert.isOk(uuid, 'uuid supplied');
                    assert.isObject(state, 'state is object');
                    done();
                });

                socket.setState(testNewStateData);

            });

        });

        describe('unsubscribe', function() {

            it('should disconnect', function() {
                socket.unsubscribe();
                socket.publish(testMessageData);
            });

        });

        describe('history', function() {

            it('should recall history', function(done) {

                this.timeout(8000);

                setTimeout(function() {
                    socket.history(function(history) {

                        assert.deepEqual(history[0].data, testMessageData, 'latest message is correct');
                        assert.isAbove(history.length, 1, 'at least one messages received');

                        done();

                    });
                }, 2500);

            });

        });

    });

});
