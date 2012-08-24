module.exports = function(mongoose, db, defaultActorImage) {

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
        updated: {type: Date, default: null},
        location: LocationHash
    };
    this.ActivityObject = db.model('activityObject', new Schema(ActivityObjectHash));

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

    return this;
};
