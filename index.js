module.exports = function (){

    var _ = require('underscore')._;
    var state = require('./lib/setup.js')(_, arguments);
    var defaultSort = '-published';

    state.types = require('./lib/activityMongoose.js')(state.mongoose, state.db, state.options.defaultActorImage);
    this.Activity = state.types.Activity;

     // Functions

    this.getActivityStreamFirehose = function(n, fx) {
        state.Activity.find().sort(defaultSort).limit(n).exec(fx);
    }

    this.getActivityStream = function(streamName, n, fx) {
        state.Activity.find({streams:streamName}).sort(defaultSort).limit(n).exec(fx);
    }

    this.publish = function(streamName, activity) {
        var publisher = state.redisPublisher;

        if (!_.isArray(activity.streams)) {
            activity.streams = []
        }
        if (!_.include(activity.streams, streamName)) {
            activity.streams.push(streamName);
        }

        activity.save(function(err) {
            if (!err && streamName && publisher) {
                publisher.publish(streamName, JSON.stringify(activity));
            }
        });
    }

    this.subscribe = function(streamName, fx) {
        if (state.redisClient && streamName) {
            state.redisClient.subscribe(streamName);
            state.redisClient.on("message", fx);
        }
    }

    this.unsubscribe = function(streamName, fx) {
        if (state.redisClient && streamName) {
            state.redisClient.unsubscribe(streamName);
        }
    }

    this.close = function() {
        state.mongoose.disconnect();

        if (state.redisClient && state.redisPublisher) {
            state.redisClient.quit();
            state.redisPublisher.quit();
        }
    }

    return this;
};
