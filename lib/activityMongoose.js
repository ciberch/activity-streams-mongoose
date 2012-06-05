module.exports = function (mon, options){

    var _ = require('underscore')._;

    if (!options) {
        options = {};
    }
    
    var mongoose = mon,
        Schema = mongoose.Schema,
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
    this.ActivityObject = mongoose.model('activityObject', new Schema(ActivityObjectHash));

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
    this.Activity = mongoose.model('activity', new Schema(ActivityHash));

    this.getActivityStreamFirehose = function(n, fx) {
        Activity.find().sort('published', 'descending').limit(n).run(fx);
    }

    this.getActivityStream = function(streamName, n, fx) {
        Activity.find({streams:streamName}).sort('published', 'descending').limit(n).run(fx);
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

    return this;
};
