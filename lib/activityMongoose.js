module.exports = function(mongoose, db, defaultActorImage) {

    _ = require("underscore");

    var Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId,
        DocumentObjectId = mongoose.Types.ObjectId;

    var MediaLinkHash = {
        duration: Number,
        height: Number,
        width: Number,
        url: String
    };


    var LocationHash = {
        displayName: {type: String},
        position: {
            latitude: Number,
            longitude: Number
        }
    };

    var BaseActivityObjectHash = function() {
        return {
						id: {type: String},
						image: {type: MediaLinkHash, default: null},
						icon: {type: MediaLinkHash, default: null},
						displayName: {type: String},
						summary: {type: String},
						content: {type: String},
						url: {type:String},
						published: {type: Date, default: null},
						objectType: {type: String},
						updated: {type: Date, default: null},
						location: LocationHash
        }
		};

    var ActivityObjectHash = _.extend(new BaseActivityObjectHash(), {
				fullImage : {type: MediaLinkHash, default: null},
				thumbnail : {type: MediaLinkHash, default: null},
				author : {type: ObjectId, ref: "activityObject"},
				attachments : [{type: ObjectId, ref: 'activityObject'}],
				upstreamDuplicates : [{type: String, default: null}],
				downstreamDuplicates : [{type: String, default: null}]
    });

    var UserHash = _.extend(new BaseActivityObjectHash(), {
        'roles' : [{type: String}],
        'photos' : [{type: ObjectId, ref: 'activityObject'}],
        'streams_followed': [{type: String}]
    });
    var defaultActor = {displayName: 'Someone', image: {url: defaultActorImage || ''}};

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
    this.User = db.model('user', new Schema(UserHash));
    this.ActivityObject = db.model('activityObject', new Schema(ActivityObjectHash));

    return this;
};
