[![build status](https://secure.travis-ci.org/ciberch/activity-streams-mongoose.png)](http://travis-ci.org/ciberch/activity-streams-mongoose)
## Overview

Activity Streams is a simple specification used to describe social actions around the web. http://activitystrea.ms

This library provides the following Activity Stream Models on Mongoose:

* ActivityObject
* Activity

For details on the properties each see pne of the following specifications:

* http://activitystrea.ms/specs/json/1.0/
* http://opensocial-resources.googlecode.com/svn/spec/2.0/Social-Data.xml#ActivityEntry


## Usage

### Implicit

```javascript
var asmsDB = require('activity-streams-mongoose')(options);
```

### Or explicit if you need a Mongoose reference in your calling code

```javascript
var mongoose = require('mongoose');
mongoose.connect(siteConf.mongoUrl);
var asmsDB = require('activity-streams-mongoose')(mongoose, options);
```

### Options

- mongoUrl --> If you want to let `activity-streams-mongoose` manage Mongoose for you, just pass the url for the MongoDB.
Example format is `mongodb://localhost/mongodb-asms`

- redis --> Hash including keys specifying connection properties
  - host
  - port
  - pass

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
asmsDB.getActivityStreamFirehose(5, function (err, docs) {
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


### To close the Activity Stream DB connections (MongoDB and Redis)

```javascript
asmsDB.close();
```

## To run tests

- Start MongoDB
- Start Redis

``` bash
npm test
```

## TODO

- Add support for location for objects