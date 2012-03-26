## Overview

Activity Streams is a simple specification used to describe social actions around the web. http://activitystrea.ms

This library provides the following Activity Stream Models on Mongoose:

* ActivityObject
* Activity

For details on the properties each see pne of the following specifications:

* http://activitystrea.ms/specs/json/1.0/
* http://opensocial-resources.googlecode.com/svn/spec/2.0/Social-Data.xml#ActivityEntry


## Usage

### First require the library passing an instance of Mongoose

```javascript
var mongoose = require('mongoose');
mongoose.connect(siteConf.mongoUrl);
var asmsDB = require('activity-streams-mongoose')(mongoose, options);
```

Options

* redis --> Hash including keys
    * host
    * port
    * pass

Redis is required to be able to publish activities and subscribe to Activity Streams

### To create an activity object you can do

```javascript
var cf = new asmsDB.ActivityObject({displayName: "Cloud Foundry" , url: "http://www.cloudfoundry.com"});
cf.save(function (err) {
    //...
    }
});

```

### To create an activity with an associated activity object you can do

```javascript

var testAct = new asmsDB.Activity({title: "Started the app", target: target._id});
testAct.save(function (err) {
    //...
});

```


### To query the Activity Streams do

Asking for the latest 5 from stream "sfgiants"

```javascript
asmsDB.getActivityStream("sfgiants", 5, function (err, docs) {
   docs.forEach(function(doc){console.log(doc);});
});

```

Asking for the latest 5 from firehose

```javascript
asmsDB.getActivityStream(5, function (err, docs) {
   docs.forEach(function(doc){console.log(doc);});
});

```

### To publish an activity you can do

```javascript

var testAct = new asmsDB.Activity({title: "Started the app", target: target._id});
asmsDB.publish('cloudfoundry-stream', testAct);

```

Note: This will save the activity and then publish it to the stream name


### To subscribe to an Activity Stream do

```javascript
var clientSendFx =  function(channel, json) {
            io.sockets.in(client.handshake.sid).send(json);
        }

asmsDB.subscribe('cloudfoundry-stream', clientSendFx);
```

## To run tests

- Start MongoDB
- Start Redis

``` bash
nodeunit test/test-activityMongoose.js
```