const MongoClient = require("mongodb").MongoClient;
const debug = require("debug")("book");
const setting = require("../setting.js");

//Mongodb 支持es6语法的,我好蠢啊

//查询数据
exports.find = async function (collection, query) {
  let db = await MongoClient.connect(setting.db_url);
  let r = await db.collection(collection).find(query).toArray();//转成数组后可以直接传给前端,不转数组各种没用
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
