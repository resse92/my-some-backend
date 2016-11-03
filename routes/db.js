const MongoClient = require("mongodb").MongoClient;
const debug = require("debug")("db");
const setting = require("../setting.js");
//数据库连接
let connect = function () {
  return new Promise(function (resolve, reject) {
    MongoClient.connect(setting.db_url, function(err, db) {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};
//插入数据
exports.find = function (collection, query) {
  return new Promise(function (resolve, reject) {
    connect().then(function (db) {
      db.collection(collection).find(query, function(err, r) {
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
