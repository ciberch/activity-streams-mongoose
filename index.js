module.exports = function (){

    var _ = require('underscore')._;
    var state = require('./lib/setup.js')(_, arguments);
    var defaultSort = '-published';
    var db = state.db;

    var types = require('./lib/activityMongoose.js')(state.mongoose, db, state.options.defaultActorImage);
    this.types = types;

    this.DB = function(db, types) {
        return {
            ActivityObject : db.model('activityObject', types.ActivityObjectSchema),
            Activity : db.model('activity', types.ActivitySchema),
            User : db.model('user', types.UserSchema)
        }
    };
     // Functions

    types.ActivitySchema.statics.getFirehose = function(n, fx) {
        this.find().sort('-published').limit(n).exec(fx);
    }

    types.ActivitySchema.statics.getStream = function(streamName, n, fx) {
        this.find({streams:streamName}).sort('-published').limit(n).exec(fx);
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
