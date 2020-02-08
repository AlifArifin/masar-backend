const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URL

var option = {
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000,
  poolSize : 40,
  useNewUrlParser: true
};

function MongoPool(){}

var mongoClientPool;

function initPool(cb){
  MongoClient.connect(url, option, (err, db) => {
    if (err) throw err;

    mongoClientPool = db;
    if(cb && typeof(cb) == 'function')
        cb(mongoClientPool);
  });
  return MongoPool;
}

MongoPool.initPool = initPool;

function getInstance(cb){
  if(!mongoClientPool){
    initPool(cb)
  }
  else{
    if(cb && typeof(cb) == 'function')
      cb(mongoClientPool);
  }
}
MongoPool.getInstance = getInstance;

module.exports = MongoPool;
