var mongooseUrl = 'mongodb://localhost/mongodb-asms';
var redisOptions = {host: '127.0.0.1', port: 6379};
var mongoose = require('mongoose');
mongoose.connect(mongooseUrl);
var asmsDB = require('../lib/activityMongoose')(mongoose, {full: true, redis: redisOptions});


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
         docs.forEach(function(doc){test.equal(doc.title, "Started the app");});
         test.done();
        }
    });

};

exports.getActivityStreamFirehose = function(test) {
    var testAct = new asmsDB.Activity({title: "An amazing app"});
    asmsDB.publish('abc', testAct);
    asmsDB.getActivityStreamFirehose(2, function(err, docs) {
        if (err) {
            test.fail();
        } else {
         docs.forEach(function(doc){test.equal(doc.title, "An amazing app");});
         test.done();
        }
    });

};