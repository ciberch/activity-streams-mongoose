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

        date = Date.now();
        lib.types.UserSchema.plugin(function(schema, options) {
            schema.add({ lastMod: {type: Date, default: date}});
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
                test.equal(String(doc.lastMod), new Date(date));
            } else{
                test.fail();
            }
            test.done();
        });
    }
};

