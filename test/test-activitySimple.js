var mongoUrl = 'mongodb://localhost/test-activity-mongoose-2';
var redisOptions = {host: '127.0.0.1', port: 6379};
var asmsDB = null;

module.exports = {

    setUp : function (callback) {
        stream_lib = require('../index')({
            full: true,
            redis: redisOptions,
            mongoUrl: mongoUrl
        });

        //////////////////////////////////////////////////////
        date = Date.now();
        stream_lib.types.UserSchema.plugin(function(schema, options) {
            schema.add({ lastMod: {type: Date, default: date}});
        });
        // Now build the models
        asmsDB = new stream_lib.DB(stream_lib.db, stream_lib.types);
        //////////////////////////////////////////////////////
        callback();

    },
    tearDown :  function(callback) {
        if (stream_lib.db) {
            stream_lib.close();
        }
        callback();
    },
    Basic: function(test) {
        asmsDB = new stream_lib.DB(stream_lib.db, stream_lib.types);
        var act = new asmsDB.Activity();
        test.notEqual(act, null);

        test.done();
    },
    DefaultFullActivity: function(test) {
        var act = new asmsDB.Activity();
        var defaultActor = new asmsDB.ActivityObject({displayName: 'Someone'});
        test.equal(act.title, null);
        test.equal(act.actor.displayName, defaultActor.displayName);
        test.equal(act.actor.image.url, '');
        test.equal(act.verb, 'post');
        test.equal(act.generator, null);

        act.save(function(err) {
            if (!err ) {
                test.equal(String(act._id).length > 0, true);
            } else {
                test.fail();
            }
            test.done();
        });
    },
    DefaultFullActivityObject: function(test) {
        var ao = new asmsDB.ActivityObject({displayName: 'A'});
        ao.save(function(err) {
            if (!err ) {
                test.equal(String(ao._id).length > 0, true);
            } else{
                test.fail();
            }
            test.done();
        });
    },
    PubSub: function(test) {
        var testAct = new asmsDB.Activity({title: "Started the app"});
        stream_lib.subscribe('cloudfoundry-stream', function(channel, json) {
            var act = JSON.parse(json);
            test.equal(testAct.title, act.title);
            test.equal(testAct.actor.displayName, act.actor.displayName);
            test.equal(String(testAct._id), String(act._id));
            test.equal(testAct.verb, act.verb);
            test.equal(testAct.streams[0], 'cloudfoundry-stream');
            test.done();
        });
        stream_lib.publish('cloudfoundry-stream', testAct);
    },
    getActivityStream: function(test) {
        var testAct = new asmsDB.Activity({title: "Started the app"});
        stream_lib.publish('abc', testAct);
        var testAct2 = new asmsDB.Activity({title: "A different title"});
        stream_lib.publish('cde', testAct2);
        asmsDB.Activity.getStream('abc', 2, function(err, docs) {
            if (err) {
                test.fail();
            } else {
                test.equal(docs.length, 1);
                docs.forEach(function(doc){test.equal(doc.title, "Started the app");});
            }
            test.done();
        });

    },
    getActivityStreamFirehose: function(test) {
        var testAct = new asmsDB.Activity({title: "Latest News", content: "There is a new rock band in SF"});
        stream_lib.publish('music', testAct);

        var testAct2 = new asmsDB.Activity({title: "Latest News", content: "Roland Garros finals winner is Rafael Nadal"});
        stream_lib.publish('sports', testAct2);

        asmsDB.Activity.getFirehose(2, function(err, docs) {
            if (err) {
                test.fail();
            } else {
             test.equal(docs.length, 2);
             docs.forEach(function(doc){test.equal(doc.title, "Latest News");});
            }
            test.done();
        });
    }
};

