module.exports = function (){

    var _ = require('underscore')._;

    var mongoose = null,
        options = {};

    if (arguments.length == 2) {
        mongoose = arguments[0];
        options = arguments[1];
    } else if (arguments.length == 1) {
        if (_.has(arguments[0], "redis") || _.has(arguments[0], "mongoUrl")) {
            options = arguments[0];
        } else if (mongoose.connection != undefined) {
            mongoose = arguments[0];
        }
    }

    if (!options.mongoUrl) {
        options.mongoUrl = "mongodb://localhost/mongodb-asms";
    }

    var db = null;

    if (!mongoose) {
        mongoose = require('mongoose');
        db = mongoose.createConnection(options.mongoUrl);
    } else {
        db = mongoose.connection;
    }
    
    var Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId,
        DocumentObjectId = mongoose.Types.ObjectId;

    var MediaLinkHash = {
        duration: Number,
        height: Number,
        width: Number,
        url: String
    };

    var ActivityObjectHash = {
        id: {type: String},
        image: MediaLinkHash,
        icon: {type: MediaLinkHash, default: null},
        displayName: {type: String},
        summary: {type: String},
        content: {type: String},
        url: {type:String},
        author: {type: ObjectId, ref: "activityObject"},
        published: {type: Date, default: null},
        objectType: {type: String},
        attachments: [{type: ObjectId, ref: 'activityObject'}],
        upstreamDuplicates: [{type: String, default: null}],
        downstreamDuplicates: [{type: String, default: null}],
        updated: {type: Date, default: null}
    };
    this.ActivityObject = db.model('activityObject', new Schema(ActivityObjectHash));

    var defaultActor = {displayName: 'Someone', image: {url: options.defaultActorImage || ''}};

    var ActivityHash = {
        id: {type: String},
        verb: {type: String, default: 'post'},
        url: {type: String},
        title: {type: String},
        content: {type: String},
        icon: {type: MediaLinkHash, default: null},
        object: {type: ActivityObjectHash, default: null},
        actor:  {type: ActivityObjectHash, default: defaultActor},
        target: {type: ActivityObjectHash, default: null},
        published: { type: Date, default: Date.now},
        updated: { type: Date, default: Date.now},
        inReplyTo: {type: ObjectId, ref: 'activity'},
        provider: {type: ActivityObjectHash, default: null},
        generator: {type: ActivityObjectHash, default: null},
        streams: [{type: String}]
    };
    this.Activity = db.model('activity', new Schema(ActivityHash));

    this.getActivityStreamFirehose = function(n, fx) {
        Activity.find().sort('-published').limit(n).exec(fx);
    }

    this.getActivityStream = function(streamName, n, fx) {
        Activity.find({streams:streamName}).sort('-published').limit(n).exec(fx);
    }

    this.redisClient        = null;
    this.redisPublisher     = null;

    if (options.redis) {
        var redis            = require("redis");
        this.redisClient     = redis.createClient(options.redis.port, options.redis.host);
        this.redisPublisher  = redis.createClient(options.redis.port, options.redis.host);
        if(options.redis.pass) {
            redisClient.auth(options.redis.pass);
            redisPublisher.auth(options.redis.pass);
        }
    }

    this.publish = function(streamName, activity) {
        var publisher = this.redisPublisher;

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
        if (this.redisClient && streamName) {
            this.redisClient.subscribe(streamName);
            this.redisClient.on("message", fx);
        }
    }

    this.unsubscribe = function(streamName, fx) {
        if (this.redisClient && streamName) {
            this.redisClient.unsubscribe(streamName);
        }
    }

    this.close = function() {
        mongoose.disconnect();

        if (this.redisClient && this.redisPublisher) {
            this.redisClient.quit();
            this.redisPublisher.quit();
        }
    }

    return this;
};
