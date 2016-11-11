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
    new rltm('pubnub', new Date(), {
        publishKey: 'pub-c-f7d7be90-895a-4b24-bf99-5977c22c66c9',
        subscribeKey: 'sub-c-bd013f24-9a24-11e6-a681-02ee2ddab7fe',
        uuid: new Date(),
        state: testStateData
    }),
    new rltm('socketio', 'test-channel', {
        endpoint: 'http://localhost:8000',
        uuid: new Date(),
        state: testStateData
    })    
];

let agent = null;
agents.forEach(function(agent){

    describe(agent.service, function() {

        describe('init', function() {

            it('should create agent object', function() {
                assert.isObject(agent, 'was successfully created');
            });

        });

        describe('ready', function() {

            it('should get called when ready', function(done) {

                agent.ready(done);
                agent.subscribe(function (data) {});

            });

            it('should get itself as a join event', function(done) {

                agent.join(function(uuid, state) {
                    assert.isOk(uuid, 'uuid is set');
                    done();
                });

            });

        });

        describe('publish subscribe', function() {

            it('should send and receive message', function(done) {

                agent.subscribe(function(uuid, data) {
                    assert.isOk(uuid, 'uuid is set')
                    assert.deepEqual(data, testMessageData, 'input data matches output data');
                    done();
                });

                agent.publish(testMessageData);

            });

        });

        describe('here now', function() {

            it('at least one user online', function(done) {

                agent.hereNow(function(users) {

                    assert.isOk(users, 'At least one user online now');
                    
                    done();

                });

            });

        });

        describe('state', function() {

            it('should set state', function(done) {

                agent.state(function(uuid, state) {
                    assert.isOk(uuid, 'uuid supplied');
                    assert.isObject(state, 'state is object');
                    done();
                });

                agent.setState(testNewStateData);

            });

        });

        describe('unsubscribe', function() {

            it('should disconnect', function() {

                agent.unsubscribe();

            });

        });

        describe('history', function() {

            it('should recall history', function(done) {

                agent.history(function(history) {
                    console.log(history);
                    done();
                });

            });

        });

    });

});
