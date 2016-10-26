"use strict";
const fs = require("fs");
const debug = require("debug")("crawler");
const MongoClient = require("mongodb").MongoClient;
const setting = require("../setting.js");

exports.mkdir = function(path, folder) {
  let mkdirp = require("mkdirp");

  mkdirp(path + "/" + folder, function(err) {
    if (err) { debug(err);}
    else {debug("pow!");}
  });
};

exports.write_total_chapter = function(path, book) {
  let content = " ";

  fs.writeFile(path + "/" + book.type + "/" + book.num + ".html", content, function(err) {
    if (err) { throw err;}
    debug("It's saved!");
  });
};

exports.write_chapter = function(path, book, chapter, content) {
  content = content.replace("[笔趣库手机版 m.biquku.com]", "");

  fs.writeFile(path + "/" + book.type + "/" + book.num + "/" + chapter.num + ".html", content, function(err) {
    if (err) {throw err;}
    debug("It's saved!");
  });
};

exports.write_config = function(path, book) {
  var content = JSON.stringify(path, book, null, 4); // Indented 4 spaces
  fs.writeFile(path + "/" + book.type + "/" + book.num + "/book.json", content, function(err) {
    if (err) { throw err;}
    debug("It's saved!");
  });
};
