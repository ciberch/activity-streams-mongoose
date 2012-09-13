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

    var ActivityObjectHash = {
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
        location: LocationHash,
        fullImage : {type: MediaLinkHash, default: null},
        thumbnail : {type: MediaLinkHash, default: null},
        author : {type: ObjectId, ref: "activityObject"},
        attachments : [{type: ObjectId, ref: 'activityObject'}],
        upstreamDuplicates : [{type: String, default: null}],
        downstreamDuplicates : [{type: String, default: null}]
    };

    var UserHash = {
        id: {type: String},
        image: {type: MediaLinkHash, default: null},
        icon: {type: MediaLinkHash, default: null},
        displayName: {type: String},
        summary: {type: String},
        content: {type: String},
        url: {type:String},
        author : {type: ObjectId, ref: "activityObject"},
        published: {type: Date, default: Date.now},
        objectType: {type: String, default: 'person'},
        updated: {type: Date, default: Date.now},
        location: LocationHash,
        'roles' : [{type: String}],
        'photos' : [{type: ObjectId, ref: 'activityObject'}],
        'streams_followed': [{type: String}]
    };
    var defaultActor = {displayName: 'Someone', objectType: 'person', image: {url: defaultActorImage || ''}};

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
        streams: [{type: String, default: []}]
    };

    var types = {
        ActivityObjectSchema : new Schema(ActivityObjectHash),
        ActivitySchema : new Schema(ActivityHash),
        UserSchema : new Schema(UserHash)
    };
    return types;
};
