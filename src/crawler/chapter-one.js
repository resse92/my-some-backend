"use strict";
const debug = require("debug")("chapter-one");
// const superagent = require("superagent");
// const cheerio = require("cheerio");
const Crawler = require("crawler");
// const jsdom = require("jsdom");
const MongoClient = require("mongodb").MongoClient;
const setting = require("../../setting.js");
const co = require("co");
let c = new Crawler();

//爬虫开始入口
function startCrawler (url) {
  function cralerResult(err, result, $) {
    if (err) {
      debug(err);
      return;
    }
    debug("进来了");
    let urls = $(".novellist");

    function *iterater2(childurl) {
      for (let i = 0; i < childurl.length; i++) {
        let x = childurl[i];
        let book = {};
        let name = $(x).children("a").text();
        let author = $(x).text();
        let href = $(x).children("a").attr("href");
        let num = href.replace(setting.crawler_url, "");
        book["name"] = name;
        book["author"] = author;
        book["origin_num"] = num;
        book["new_index"] = i;
        yield getBookInfo(num, i);
      }
    }

    function *iterater1() {
      for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        let childurl = $(url).children("ul").children();
        // iterater(childurl).next();
        yield iterater2(childurl);
        if (i === childurl.length) {
          debug("获取书完毕" + childurl.length);
        }
      }
    }
    co(iterater1());

  }
  c.queue([{
      // jQuery: jsdom,
    uri: url,
    maxConnections: 1000,
    forceUTF8: true,

    callback: cralerResult
  }]);
}

//爬虫一本书
function getBookInfo(params, index) {
  let current_book = { };

  var arr = params.split("/");
  current_book.type = arr[0];
  current_book.num = arr[1];
  current_book.index = index;
  c.queue([{
    uri: setting.crawler_url + params,
    maxConnections: 1000,
    forceUTF8: true,
        // This will be called for each crawled page
    callback: function(err, result, $) {
      var urls = $("#list a");
      current_book.title = $("#maininfo h1").text();
      current_book.author = $("#info p").eq(0).text().replace("作    者：", "");
      current_book.update_time = $("#info p").eq(2).text().replace("更新时间：", "");
      current_book.latest_chapter = $("#info p").eq(3).children("a").text();
      current_book.intro = $("#intro").text();
      current_book.cover = $("#fmimg img").attr("data-cfsrc");
      current_book.chapterCount = urls.length;
      // current_book.chapterCount = 0;

      //插入数据库
      MongoClient.connect(setting.db_url, function(err, db) {
          // assert.equal(null, err);
        if (!err) {
          let col = db.collection("allbooks");
          col.insertOne(current_book, function(err, r) {
            db.close();
            if (err) {
              debug(err);
            } else {
              debug("插入书成功");
            }
          });
        }
      });

      for (var i = 0; i < urls.length; i++) {
        var url = urls[i];

        var _url = $(url).attr("href") + "";
        var num = _url.replace(".html", "");
        var title = $(url).text();

        let chapters = {
          num: num,
          title: title,
          url: _url,
          index: i
        };
        one(current_book, chapters);
      }
    }}]);
}

//获取某一本书
function one(book, chapter) {

  var arr = [book.type, book.num];

  //确认是否存在这本书,需要更新还是从头开始爬
  c.queue([{
    uri: setting.crawler_url + arr[0] + "/" + arr[1] + "/" + chapter.num + ".html",
    // jQuery: jsdom,
    maxConnections: 1000,
    forceUTF8: true,
      // The global callback won't be called
    callback: function(error, result, $) {
      //章节内容
      if (!error) {
        if ($("#content") === null) {
          debug(book + chapter);
        }
        var content = $("#content").text();
        //这里做content塞入处理
        chapter.content = content;
        // book.chapterCount++;
        MongoClient.connect(setting.db_url, function(err, db) {
          if (!err) {
            db.collection(book.index + "").insert(chapter, function(err, r) {
              db.close();
              if (err) {
                debug(err);
              } else {
                debug("插入章节成功");
              }
            });
          }
        });
      }
    }
  }]);
}


module.exports = function start() {
  // Queue just one URL, with default callback
  debug("开始爬虫");
  co(startCrawler("http://www.biquku.com/xiaoshuodaquan"));
};
