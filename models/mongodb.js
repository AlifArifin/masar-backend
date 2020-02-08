const MongoClient = require('mongodb').MongoClient;
const MongoPool = require('./mongoPool');
const async = require('async');
const dbName = process.env.MONGODB_NAME

let connectionPool = undefined;

class mongoDB {
	setupDb() {
		let self = this;
		async.waterfall([
			(cb) => {
				MongoPool.getInstance((conn) => {
					cb(null, conn);
				});
            }, 
            // (conn, cb) => {
            //     let db = conn.db(dbName);
			// 	db.createCollection('tipsntricks', (err, result) => {
			// 		if (err) {
			// 			return cb(err);					
			// 		}
			// 		cb(null, conn);
			// 	});
            // },
			(conn, cb) => {
				let db = conn.db(dbName);
				db.createCollection('recipes_detail', (err, result) => {
					if (err) {
						return cb(err);					
					}
					return cb('Database Prepared');
				});
            },
		], (data) => {
			console.log(data)
		})
	}
}

module.exports = mongoDB;