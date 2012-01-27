module.exports = function (mon, options){

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
        displayName: {type: String},
        summary: {type: String},
        content: {type: String},
        url: {type:String},
        author: {type: ObjectId, ref: 'activityObject'},
        published: {type: Date, default: null},
        objectType: {type: String}
    };

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
        target: {type: ObjectId, ref: 'activityObject'},
        published: { type: Date, default: Date.now}

    };

    if (options.full) {
        ActivityObjectHash.attachments = [{type: ObjectId, ref: 'activityObject'}];
        ActivityObjectHash.upstreamDuplicates = [{type: String, default: null}];
        ActivityObjectHash.downstreamDuplicates= [{type: String, default: null}];
        ActivityObjectHash.updated = {type: Date, default: null};

        ActivityHash.updated = { type: Date, default: Date.now};
        ActivityHash.inReplyTo = {type: ObjectId, ref: 'activity'};
        ActivityHash.provider = {type: ObjectId, ref: 'activityObject'};
        ActivityHash.generator = {type: ObjectId, ref: 'activityObject'};
    }

    this.ActivityObject = mongoose.model('activityObject', new Schema(ActivityObjectHash));
    this.Activity = mongoose.model('activity', new Schema(ActivityHash));

    this.getActivityStream = function(n, fx) {
        Activity.find().sort('published', 'descending').limit(n).populate('target').run(fx);
    }

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
        var publisher = redisPublisher;
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
