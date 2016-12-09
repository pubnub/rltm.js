"use strict";

// include the NodeJS event emitter
const EventEmitter = require('events');

// include the PubNub javascript sdk v4
const PubNub = require('pubnub');
let globalReady = false;

// represents a connection to a single channel
class Room extends EventEmitter {

    constructor(pubnub, channel, uuid, state) {

        // call the EventEmitter constructor
        super();

        // determine the client's state 
        this.state = state || {};

        // store this clients uuid
        this.uuid = uuid;

        // assign the channel parameter as a property
        this.channel = channel;

        // save pubnub in the instance of room
        this.pubnub = pubnub;

        this.isReady = false;
        
        // use the PubNub library to listen for messages
        this.pubnub.addListener({

            status: (statusEvent) => {

                // detect if this is a connection event on this channel
                if (statusEvent.category === "PNConnectedCategory" 
                    && !this.isReady
                    && statusEvent.affectedChannels.indexOf(channel) > -1) {

                    globalReady = true;

                    // tell the client that first connection made
                    this.onReady();

                }
            }
        });

        this.pubnub.addListener({
            message: (m) => {

                // if message is sent to this specific channel
                if(channel == m.channel) {

                    // emit the message as an event
                    this.emit('message', m.message.uuid, m.message.data);   

                }
            },
            presence: (presenceEvent) => {

                // make sure channel matches this channel
                if(channel == presenceEvent.channel) {

                    // someone joins channel
                    if(presenceEvent.action == "join") {

                        this.emit('join', 
                            presenceEvent.uuid, presenceEvent.state);
                    }

                    // someone leaves channel
                    if(presenceEvent.action == "leave") {
                        this.emit('leave', presenceEvent.uuid);
                    }

                    // someone timesout
                    if(presenceEvent.action == "timeout") {
                        this.emit('timeout', presenceEvent.uuid);
                    }
                    
                    // someone's state is updated
                    if(presenceEvent.action == "state-change") {
                        this.emit('state', 
                            presenceEvent.uuid, presenceEvent.state);
                    }
                       
                }

            }
        });

        // tell PubNub to subscribe to the supplied channel
        this.pubnub.subscribe({ 
            channels: [channel],
            withPresence: true,
            state: state
        });

    }

    // ready is a callback and not an event because pubnub may be ready
    // immediately, which doesn't allow time to register an event handler
    // this can be solved with setTimeout(() => {}, 10) to let the 
    onReady() {

        // waiting to be assigned by client
        return;

    }

    ready (fn) {
        
        this.onReady = fn;

        if(globalReady) {
            this.onReady()
            this.isReady = true;
        }

    }

    publish (data) {

        return new Promise((resolve, reject) => {
          
          // publish the given data over PubNub channel
          this.pubnub.publish({
              channel: this.channel,
              message: {
                  uuid: this.uuid,
                  data: data
              }
          }, (status, response) => {

            if(status.error) {
                // if there's a problem publishing, reject
                reject(status);
            } else {
                resolve();
            }

          });

        });

    };

    hereNow(cb) {

        return new Promise((resolve, reject) => {
        
            // ask PubNub for information about connected clients in this channel
            this.pubnub.hereNow({
                channels: [this.channel],
                includeUUIDs: true,
                includeState: true
            }, (status, response) => {

                if(status.error) {
                    // if there's a problem with the request, reject
                    reject(status)
                } else {

                    // build a userlist in rltm.js format
                    let userList = {};

                    // get the list of occupants in this channel
                    let occupants = response.channels[this.channel].occupants;

                    // format the userList for rltm.js standard
                    for(let i in occupants) {
                        userList[occupants[i].uuid] = occupants[i].state;
                    }

                    // respond with formatted list
                    resolve(userList);

                }

            });

        });

    }

    setState(state) {

        return new Promise((resolve, reject) => {
            
            // use PubNub state function to update state for channel
            this.pubnub.setState({
                state: state,
                uuid: this.uuid,
                channels: [this.channel]
            }, (status, response) => {
                
                if(status.error) {
                    // if there's a problem with the request log it
                    reject(status);            
                } else {
                    resolve();
                }

            });

        });

    }

    history(cb) {
        
        return new Promise((resolve, reject) => {

            // retrieved the message history with PubNub
            this.pubnub.history({
                channel: this.channel,
                count: 100 // how many items to fetch
            }, (status, response) => {

                if(status.error) {
                    // if there's a problem with the request log it
                    reject(status);            
                } else {
                    
                    // create our return array
                    let data = [];

                    // loop through response and push data to array
                    for(let i in response.messages) {
                        data.push(response.messages[i].entry)
                    }   

                    // reverse the array so newest are first
                    data = data.reverse();

                    // respond with the history data
                    resolve(data);

                }

            });

        });

    }

    unsubscribe() {

        return new Promise((resolve, reject) => {
            
            // tell PubNub to manually unsubscribe from this channel        
            this.pubnub.unsubscribe({
                channels: [this.channel],
            });

            resolve();

        });

    }
}

// export a generic function expected by rltm.js
module.exports = function(setup) {

    // convenience method to assign the service string name to itself
    this.service = setup.service;

    // initialize PubNub with supplied config information
    let pubnub = new PubNub(setup.config);

    // expose the join method to create new room connections
    this.join = (channel, state) => {
        return new Room(pubnub, channel, setup.config.uuid, state);
    }

    // return the instance of this service
    return this;

};
