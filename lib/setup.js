module.exports = function (_, args){
    this.mongoose = null;
    this.options = {};

    if (args.length == 2) {
        this.mongoose = args[0];
        this.options = args[1];
    } else if (args.length == 1) {
        if (_.has(args[0], "redis") || _.has(args[0], "mongoUrl")) {
            this.options = args[0];
        } else if (this.mongoose.connection != undefined) {
            this.mongoose = args[0];
        }
    }

    if (!this.options.mongoUrl) {
        this.options.mongoUrl = "mongodb://localhost/mongodb-asms";
    }

    this.db = null;

    if (!this.mongoose) {
        this.mongoose = require('mongoose');
        this.db = this.mongoose.createConnection(this.options.mongoUrl);
    } else {
        this.db = this.mongoose.connection;
    }

    this.realMongoDB = this.db.db;

    this.GridStore = this.mongoose.mongo.GridStore;

    this.redisClient        = null;
    this.redisPublisher     = null;

    if (this.options.redis) {
        var redis            = require("redis");
        this.redisClient     = redis.createClient(this.options.redis.port, this.options.redis.host);
        this.redisPublisher  = redis.createClient(this.options.redis.port, this.options.redis.host);

        if (this.options.redis.database) {
            this.redisClient.select(this.options.redis.database);
            this.redisPublisher.select(this.options.redis.database);
        }

        if(this.options.redis.pass) {
            this.redisClient.auth(this.options.redis.pass);
            this.redisPublisher.auth(this.options.redis.pass);
        }
    }

    return this;
};