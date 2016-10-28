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
//爬虫
let crawler = function (url) {
  return new Promise(function (resolve, reject) {
    c.queue([{
      uri: url,
      maxConnections: 1000,
      forceUTF8: true,
            // This will be called for each crawled page
      callback: function(err, result, $) {
        if (err) {
          reject(err);
        } else {
          resolve($);
        }
      }
    }]);
  });
};
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
//数据库插入
let insert = function (collection, data) {
  return new Promise(function (resolve, reject) {
    connect().then(function (db) {
      db.collection(collection).insert(data, function(err, r) {
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

//爬虫开始入口
function startCrawler (url) {
  crawler(url).then(function ($) {
    let urls = $(".novellist");
    let bookIndex = 1;
    function *iterater1() {
      //遍历每个类别
      for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        let childurl = $(url).children("ul").children();//取得书的url
        //遍历每一本书
        for (let j = 0; j < childurl.length; j++) {
          let x = childurl[j];
          let href = $(x).children("a").attr("href");
          let num = href.replace(setting.crawler_url, "");
          let book = getBookInfo(num, bookIndex++);
          yield book;
        }
        if (i === childurl.length - 1) {
          debug("获取书完毕" + childurl.length);
        }
      }
    }
    let a = iterater1();
    co(a).then(function () {
      debug("完成");
    }).catch(function (err) {
      debug(err);
    });
  });

}

//爬虫一本书
function getBookInfo(num, index) {
  let current_book = { };
  var arr = num.split("/");
  current_book.type = arr[0];
  current_book.num = arr[1];
  current_book.index = index;

  return crawler(setting.crawler_url + num).then(function ($) {
      //取得书籍信息
    var urls = $("#list a");
    current_book.title = $("#maininfo h1").text();
    current_book.author = $("#info p").eq(0).text().replace("作    者：", "");
    current_book.update_time = $("#info p").eq(2).text().replace("更新时间：", "");
    current_book.latest_chapter = $("#info p").eq(3).children("a").text();
    current_book.intro = $("#intro").text();
    current_book.cover = $("#fmimg img").attr("data-cfsrc");
    current_book.chapterCount = urls.length;
    let x = [];
    let insertBook = insert("biquku", current_book).then(function () {
      debug("插入书完成");
    });
    x.push(insertBook);
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
      let y = crawler(setting.crawler_url + current_book.type + "/" + current_book.num + "/" + num + ".html")
      .then(function ($) {
        if ($("#content") === null) {
          debug(current_book + chapters);
        }
        var content = $("#content").text();
        //这里做content塞入处理
        chapters.content = content;
        return insert(current_book.index + "", chapters);
      })
      .then(function (r) {
        debug("插入 书" + current_book.index + " 章节" + chapters.index + " 成功");
      });
      x.push(y);
    }
    // 这边去掉了Promise.all()就可以多线程查询了,为什么??????
    // return Promise.all(x).then(function () {
    //   debug("成功");
    // });
  });
}

module.exports = function start() {
  // Queue just one URL, with default callback
  debug("开始爬虫");
  startCrawler("http://www.biquku.com/xiaoshuodaquan");
};
