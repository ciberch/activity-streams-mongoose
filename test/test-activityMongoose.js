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
        test.done();
    });
    asmsDB.publish('cloudfoundry-stream', testAct);
};
