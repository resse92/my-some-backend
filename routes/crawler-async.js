"use strict";
const debug = require("debug")("chapter-one");
const Crawler = require("crawler");
const setting = require("../setting.js");
let c = new Crawler();
const mongoose = require("mongoose");

let book = require("./models/book.js");
let chapter = require("./models/chapter.js");

mongoose.connect(setting.db_url);
const db = mongoose.connection;
//连接数据库成功或者失败这里回调;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  // 成功回调
  debug("连接数据库成功");
});

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

// 爬虫所有书籍开始入口
function startCrawler (url) {
  crawler(url).then(async function ($) {
    let urls = $(".novellist");
    let bookIndex = 1;
    // 遍历每个类别
    for (let i = 0; i < urls.length; i++) {
      let url = urls[i];
      let childurl = $(url).children("ul").children();//取得书的url
      // 遍历每一本书
      for (let j = 0; j < childurl.length; j++) {
        let x = childurl[j];
        let href = $(x).children("a").attr("href");
        let num = href.replace(setting.crawler_url, "");
        await getBookInfo(num, bookIndex++);
      }
      if (i === childurl.length - 1) {
        debug("获取书完毕" + childurl.length);
      }
    }
  }).catch(function(err) {
    debug(err);
  });
}

//爬虫一本书
function getBookInfo(num, index) {
  
  let bookmodel = book.model("biquku");
  let current_book = bookmodel({});
  var arr = num.split("/");
  current_book.type = arr[0];
  current_book.num = arr[1];
  current_book.index = index;

  return crawler(setting.crawler_url + num).then(function ($) {
      //取得书籍信息
    var urls = $("#list a");
    current_book.name = $("#maininfo h1").text();
    current_book.author = $("#info p").eq(0).text().replace("作    者：", "");
    current_book.update_time = $("#info p").eq(2).text().replace("更新时间：", "");
    current_book.latest_chapter = $("#info p").eq(3).children("a").text();
    current_book.intro = $("#intro").text();
    current_book.cover = $("#fmimg img").attr("data-cfsrc");
    current_book.chapterCount = urls.length;
    
    // 插入书籍
    bookmodel.update({index: current_book.index}, {$set: current_book}, {upsert: true}).exec();

    for (var i = 0; i < urls.length; i++) {
      var url = urls[i];

      var _url = $(url).attr("href") + "";
      var num = _url.replace(".html", "");// 笔趣库的章节码数，没有存
      var title = $(url).text();

      let chaptersModel = chapter.model(current_book.num + "");
      let chapters = chaptersModel({
        title: title,
        url: _url,
        index: i,
        content: "暂无章节信息"
      });
      
      crawler(setting.crawler_url + current_book.type + "/" + current_book.num + "/" + num + ".html")
      .then(($) => {
        if ($("#content") === null) {
          debug(current_book + chapters);
        }
        var content = $("#content").text();
        //这里做content塞入处理
        chapters.content = content;
        let origin = {
          index: i
        };
        return chaptersModel.update(origin, {$set: chapters}, {upsert: true}).exec();
      }).then(function (r) {
        debug("插入 书" + current_book.index + " 章节" + chapters.index + " 成功");
      }).catch(function(err) {
        debug(err);
      });
      
    }
  }).catch(function(err) {
    debug(err);
  });
}

async function getHomePage() {
  let res = await crawler("http://www.37zw.com/").then(function($) {
    let res = {};
    //获取热门
    let hot = $("#hotcontent").children(".l").children(".item");
    let hotRes = [];
    for (let x = 0; x < hot.length; x++) {
      let i = hot[x];
      let rec = {};
      rec.book_src = $(i).children(".image").children("a").attr("href");
      rec.cover = $(i).children(".image").children("a").children("img").attr("data-cfsrc");
      rec.title = $(i).children("dl").children("dt").children("a").text();
      rec.author = $(i).children("dl").children("dt").children("span").text();
      rec.intro = $(i).children("dl").children("dd").text();
      hotRes.push(rec);
    }

    // 获取各分类书籍
    let categoryReses = [];
    let lists = $(".novelslist").children(".content").children("ul");
    for (let x = 0; x < lists.length; x++) {
      let categoryRes = [];
      let list = lists[x];
      let contents = $(list).children("li");
      for (let y = 0; y < contents.length; y++) {
        let c = {};
        let content = contents[y];
        let name = $(content).children("a").text();
        let src = $(content).children("a").attr("href");
        let author = $(content).text().replace(name, "");
        c.title = name;
        c.author = author;
        c.src = src;
        categoryRes.push(c);
      }
      categoryReses.push(categoryRes);
    }

    // 获取最新更新列表
    let latestUpdates = [];
    let latests = $("div#newscontent>.l>ul>li");
    for (let x = 0; x < latests.length; x ++) {
      let c = {};
      let latest = latests[x];
      c.category = $(latest).children(".s1").text();
      c.title = $(latest).children(".s2").text();
      c.book_src = $(latest).children(".s2").children("a").attr("href");
      c.chapter_src = $(latest).children(".s3").children("a").attr("href");
      c.chapter = $(latest).children(".s3").children("a").text();
      c.author = $(latest).children(".s4").text();
      c.date = $(latest).children(".s5").text();
      latestUpdates.push(c);
    }

    // 获取最新入库小说
    let latestBook = [];
    let latestBooks = $("div#newscontent>.r>ul>li");
    for (let x = 0; x < latestBooks.length; x ++) {
      let c = {};
      let latest = latestBooks[x];
      c.title = $(latest).children(".s2").text();
      c.book_src = $(latest).children(".s2").children("a").attr("href");
      c.author = $(latest).children(".s5").text();
      latestBook.push(c);
    }
    return {
      hot: hotRes,
      category: categoryReses,
      latest_update: latestUpdates,
      latest_book: latestBook
    };
  }).catch(function(err) {
    debug(err);
    return ("数据错误");
  });
  return res;
}


module.exports.crawlerAll = function start(url) {
  // Queue just one URL, with default callback
  startCrawler(url);
};

module.exports.crawlerOneBook = getBookInfo;

module.exports.crawlerHomePage = getHomePage;
