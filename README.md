# Overview

This library contains a set of Mongoose Schemas to store  your Activities in

# Usage

```javascript

var target = new asmsDB.ActivityObject({displayName: "Cloud Foundry" , url: "http://www.cloudfoundry.com"});
target.save(function (err) {
    if (err === null) {
        var testAct = new asmsDB.Activity({title: "Started the app", target: target._id});
        testAct.save(function (err) {
            if (err === null) {
                asmsDB.Activity.find().sort('published', 'descending').limit(1).populate('target').run(function (err, doc) {
                   console.log("Last activity is " + doc);
                });
            }
        });
    }
});

```