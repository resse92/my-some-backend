const MongoClient = require("mongodb").MongoClient;
const debug = require("debug")("book");
const setting = require("../setting.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose.connect(setting.db_url);
const connection = mongoose.connection;
connection.on('error', (err) => {
  debug(err);
})

//查询数据
exports.find = async function (collection, query, count) {
  let db = await MongoClient.connect(setting.db_url);
  let skipCount = isNaN(parseInt(query.index)) ? 0 : parseInt(query.index);
  let r = await db.collection(collection).find(query).sort({index: 1}).skip(skipCount).limit(parseInt(count)).toArray();//转成数组后可以直接传给前端,不转数组各种没用
  return r;
};

//
exports.update = function (collection, origin, data) {
  return new Promise(function (resolve, reject) {
    connect().then(function (db) {
      db.collection(collection).updateOne(origin, {$set: data}, {upsert: true}, function(err, r) {
        db.close();
        if (err) {
          debug(err);
          reject(err);
        } else {
          resolve(r);
        }
      });
    });
  });
};
