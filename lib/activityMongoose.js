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

module.exports = function (mon){

    var mongoose = mon,
        Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId,
        DocumentObjectId = mongoose.Types.ObjectId;


    var MediaLink = new Schema({
        duration: Number,
        height: Number,
        width: Number,
        url: String
    });

    var ActivityObjectSchema = new Schema({
       id: {type: String},
       _images: [MediaLink],
       displayName: {type: String},
       summary: {type: String},
       content: {type: String},
       url: {type:String},
       author: {type: ObjectId, ref: 'activityObject'},
       published: {type: Date, default: Date.now},
       updated: {type: Date, default: Date.now},
       objectType: {type: String},
       attachments: [{type: ObjectId, ref: 'activityObject'}],
       upstreamDuplicates: [String],
       downstreamDuplicates: [String]
    });

    this.ActivityObject = mongoose.model('activityObject', ActivityObjectSchema);

    var ActivitySchema = new Schema({
        id: {type: String},
        verb: {type: String},
        url: {type: String},
        title: {type: String},
        content: {type: String},
        _icons: [MediaLink],
        _objects: [ActivityObjectSchema],
        _actors: [ActivityObjectSchema],
        target: {type: ObjectId, ref: 'activityObject'},
        published: { type: Date, default: Date.now},
        updated: { type: Date, default: Date.now},
        inReplyTo: {type: ObjectId, ref: 'activity'}
    });

    this.Activity = mongoose.model('activity', ActivitySchema);

    return this;
};
