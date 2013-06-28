module.exports = function (){

    var _ = require('underscore')._;
    var state = require('./lib/setup.js')(_, arguments);
    var defaultSort = '-published';
    var db = state.db;

    var types = require('./lib/activityMongoose.js')(state.mongoose, db, state.options.defaultActorImage);

     // Functions
    types.ActivitySchema.statics.getFirehose = function(n, fx) {
        this.find().sort(defaultSort).limit(n).exec(fx);
    }

    types.ActivitySchema.statics.getStream = function(streamName, n, fx) {
        this.find({streams:streamName}).sort(defaultSort).limit(n).exec(fx);
    }

    types.ActivitySchema.methods.publish = function(streamName, fx) {
        var self = this;
        var publisher = state.redisPublisher;

        if (!_.isArray(this.streams)) {
            this.streams = []
        }
        if (!_.include(this.streams, streamName)) {
            this.streams.push(streamName);
        }

        this.save(function(err, doc) {
            if (fx) fx.call(self, err, doc);
            if (!err && streamName && publisher) {
                publisher.publish(streamName, JSON.stringify(doc));
            }
        });
    }

    types.ActivitySchema.statics.subscribe = function(streamName, fx) {
        if (state.redisClient && streamName) {
            state.redisClient.subscribe(streamName);
            state.redisClient.on("message", fx);
        }
    }

    types.ActivitySchema.statics.unsubscribe = function(streamName, fx) {
        if (state.redisClient && streamName) {
            state.redisClient.unsubscribe(streamName);
        }
    }

    this.types = types;

    this.DB = function(db, types) {
        return {
            ActivityObject : db.model('activityObject', types.ActivityObjectSchema),
            Activity : db.model('activity', types.ActivitySchema),
            User : db.model('user', types.UserSchema)
        }
    };

    this.close = function() {
        state.mongoose.disconnect();

        if (state.redisClient && state.redisPublisher) {
            state.redisClient.quit();
            state.redisPublisher.quit();
        }
    }

    return this;
};
