var mongoUrl = 'mongodb://localhost/test-activity-mongoose-3';
var redisOptions = {host: '127.0.0.1', port: 6379};
var userDB = null;

module.exports = {
    setUp : function (callback) {
        lib = require('../index')({
            full: true,
            redis: redisOptions,
            mongoUrl: mongoUrl
        });

        lib.types.UserSchema.plugin(function(schema, options) {
            schema.add({ lastMod: {type: Date, default: Date.now}});
        });
        // Now build the models
        userDB = new lib.DB(lib.db, lib.types);
        callback();

       },
       tearDown :  function(callback) {
           if (lib.db) {
               lib.close();
           }
           callback();
       },
    UserSchemaPlugin: function(test) {

        var user = new userDB.User({displayName: 'Tom'});
        user.save(function(err, doc) {
            if (!err ) {
                test.equal(String(doc._id).length > 0, true);
                test.equal(String(doc.displayName), 'Tom');

                // Ensure the new schema is being applied
                var date1 = doc.lastMod;
                var date2 = Date.now();
                var diff = date2 - date1;
                console.log("Diff is " + (diff))
                test.equal((diff > 0 && diff < 30), true );
            } else{
                test.fail();
            }
            test.done();
        });
    }
};

