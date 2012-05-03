var mongooseUrl = 'mongodb://localhost/test-activity-mongoose';
var redisOptions = {host: '127.0.0.1', port: 6379};
var mongoose = require('mongoose');
mongoose.connect(mongooseUrl);
var asmsDB = require('../lib/activityMongoose')(mongoose, {full: true, redis: redisOptions});

exports.setUp = function (callback) {
    asmsDB.Activity.remove({}, function() {
        console.log("Removed Activity Objects");

        asmsDB.ActivityObject.remove({}, function(){
            console.log("Removed Activities");
            callback();
        });
    });

};

exports.DefaultFullActivity = function(test) {
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
            test.done();
        } else{
            test.fail();
        }
    });
};

exports.DefaultFullActivityObject = function(test) {
    var ao = new asmsDB.ActivityObject({displayName: 'A'});
    ao.save(function(err) {
        if (!err ) {
            test.equal(String(ao._id).length > 0, true);
            test.done();
        } else{
            test.fail();
        }
    });
};

exports.PubSub = function(test) {
    var testAct = new asmsDB.Activity({title: "Started the app"});
    asmsDB.subscribe('cloudfoundry-stream', function(channel, json) {
        var act = JSON.parse(json);
        test.equal(testAct.title, act.title);
        test.equal(testAct.actor.displayName, act.actor.displayName);
        test.equal(String(testAct._id), String(act._id));
        test.equal(testAct.verb, act.verb);
        test.equal(testAct.streams[0], 'cloudfoundry-stream');
        test.done();
    });
    asmsDB.publish('cloudfoundry-stream', testAct);
};

exports.getActivityStream = function(test) {
    var testAct = new asmsDB.Activity({title: "Started the app"});
    asmsDB.publish('abc', testAct);
    var testAct2 = new asmsDB.Activity({title: "A different title"});
    asmsDB.publish('cde', testAct2);
    asmsDB.getActivityStream('abc', 2, function(err, docs) {
        if (err) {
            test.fail();
        } else {
		    test.equal(docs.length, 1);
            docs.forEach(function(doc){test.equal(doc.title, "Started the app");});
            test.done();
        }
    });

};

exports.getActivityStreamFirehose = function(test) {
    var testAct = new asmsDB.Activity({title: "Latest News", content: "There is a new rock band in SF"});
    asmsDB.publish('music', testAct);

    var testAct2 = new asmsDB.Activity({title: "Latest News", content: "Roland Garros finals winner is Rafael Nadal"});
    asmsDB.publish('sports', testAct2);

    asmsDB.getActivityStreamFirehose(2, function(err, docs) {
        if (err) {
            test.fail();
        } else {
         test.equal(docs.length, 2);
         docs.forEach(function(doc){test.equal(doc.title, "Latest News");});
         test.done();
        }
    });

};