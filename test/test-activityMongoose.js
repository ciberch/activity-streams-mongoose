var mongoUrl = 'mongodb://localhost/test-activity-mongoose';
var redisOptions = {host: '127.0.0.1', port: 6379};
var mongoose = require('mongoose');
var asmsDB = null;

module.exports = {

    setUp : function (callback) {

        mongoose.connect(mongoUrl);

        streamLib = require('../index')({
            full: true,
            redis: redisOptions
        });

        //////////////////////////////////////////////////////
        streamLib.types.UserSchema.plugin(function(schema, options) {
            schema.add({ lastMod: {type: Date, default: Date.now}});
        });
        // Now build the models
        asmsDB = new streamLib.DB(streamLib.db, streamLib.types);
        //////////////////////////////////////////////////////

        asmsDB.Activity.remove({}, function() {
            asmsDB.ActivityObject.remove({}, function(){
                callback();
            });
        });

    },
    tearDown :  function(callback) {
        if (streamLib) {
            streamLib.close();
        }
        callback();
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
        asmsDB.Activity.subscribe('cloudfoundry-stream', function(channel, json) {
            var act = JSON.parse(json);
            test.equal(testAct.title, act.title);
            test.equal(testAct.actor.displayName, act.actor.displayName);
            test.equal(String(testAct._id), String(act._id));
            test.equal(testAct.verb, act.verb);
            test.equal(testAct.streams[0], 'cloudfoundry-stream');
            test.done();
        });
        testAct.publish('cloudfoundry-stream');
    },
    getActivityStream: function(test) {
        var testAct = new asmsDB.Activity({title: "Started the app"});
        testAct.publish('abc');
        var testAct2 = new asmsDB.Activity({title: "A different title"});
        testAct2.publish('cde');
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
        testAct.publish('music');

        var testAct2 = new asmsDB.Activity({title: "Latest News", content: "Roland Garros finals winner is Rafael Nadal"});
        testAct2.publish('sports');

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

