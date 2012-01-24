/*
{ status:
   { code: 200,
     http: '17786B in 0.300956593s, 7/15 new entries',
     nextFetch: 1327177249,
     title: 'San Francisco - Twitter Search',
     entriesCountSinceLastMaintenance: 17626,
     period: '90',
     lastFetch: 1327177155,
     lastParse: 1327177155,
     lastMaintenanceAt: 1215824721,
     digest: false,
     feed: 'http://search.twitter.com/search.atom?q=San+Francisco' },
  updated: 1327177155,
  id: 'http://search.twitter.com/search.atom?q=San+Francisco',
  title: 'San Francisco - Twitter Search',
  subtitle: '',
  standardLinks:
   { self: [ [Object] ],
     search: [ [Object] ],
     refresh: [ [Object] ],
     next: [ [Object] ] },
  permalinkUrl: 'http://search.twitter.com/search?q=San+Francisco',
  items:
   [ { id: 'tag:search.twitter.com,2005:160818620010725377',
       postedTime: 1327177121,
       updated: 1327177121,
       title: 'RT @alexaquino: Releases today at BLACK SCALE San Francisco http://t.co/7ifkNbtx',
       summary: '',
       content: 'RT @<a class=" " href="http://twitter.com/alexaquino">alexaquino</a>: Releases today at BLACK SCALE <em>San</em> <em>Francisco</em> <a href="http://t.co/7ifkNbtx">http://t.co/7ifkNbtx</a>',
       permalinkUrl: 'http://twitter.com/papalote415/statuses/160818620010725377',
       image: 'http://a2.twimg.com/profile_images/1746882898/image_normal.jpg',
       actor: [Object] },
     
*/

module.exports = function (mon, options){

    if (options === null) {
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

    var ActivityHash = {
        id: {type: String},
        verb: {type: String, default: 'post'},
        url: {type: String},
        title: {type: String},
        content: {type: String},
        icon: {type: MediaLinkHash, default: null},
        object: {type: ActivityObjectHash, default: null},
        actor:  {type: ActivityObjectHash, default: null},
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

    if (options.redis !== null) {
        var redis           = require("redis");
        this.redisClient     = redis.createClient(options.redis.port, options.redis.hostname);
        this.redisPublisher  = redis.createClient(options.redis.port, options.redis.hostname);
        if(options.redis.pass) {
            redisClient.auth(options.redis.pass);
            redisPublisher.auth(options.redis.pass);
        }
    }

    this.publish = function(streamName, activity) {
        var publisher = this.redisPublisher;
        activity.save(function(err) {
            if (err === null && publisher !== undefined && streamName !== null) {
                publisher.publish(streamName, JSON.stringify(activity));
            }
        });
    }

    this.subscribe = function(streamName, fx) {
        var redisClient = this.redisClient;
        if (redisClient !== undefined && streamName !== null) {
            redisClient.subscribe(streamName);
            redisClient.on("message", fx);
        }
    }

    return this;
};
