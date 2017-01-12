"use strict";
const router = require("koa-router")();
const crawler = require("./crawler-async.js");
const db = require("./db.js");
const debug = require("debug")("chapter-one");
const setting = require("../setting.js");

router.get("/", async (ctx, next) => {
  debug("开始");
  let res = await crawler.crawlerHomePage();
  ctx.res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
  ctx.res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  ctx.res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  //Access-Control-Allow-Origin: *
  ctx.body = res;
});

//根据分类查询分类书籍
router.get("/:category", async (ctx, next) => {
  let r = await getCategory(ctx.params.category);
  ctx.body = r;
});

router.get("/crawler/allbook", (ctx, next) => {
  crawler.crawlerAll("http://www.biquku.com/xiaoshuodaquan");
  ctx.body = "开始爬虫全部书籍";
});

router.get("/search/:keyword", (ctx, next) => {
  debug("search");
  crawler.search(ctx.params.keyword);
});

//查询书籍信息
router.get("/:category/:num", async (ctx, next) => {
  if (ctx.params.category === "book") {
    next();
    return;
  }
  let r = await getBookInfo(ctx.params.category, ctx.params.num);
  ctx.body = r;
});

//取得章节
router.get("/book/:bookNum/:startChapter", async (ctx, next) => {
  if (ctx.params.bookNum === "crawler") {
    next();
    return;
  }
  ctx.body = await getChapter(ctx.params.bookNum, ctx.params.startChapter, ctx.query.count);
});

function getCategory(category) {
  // return db.find("biquku", {type: category + ""});
  return db.find("biquku", {type: category});
}

function getChapter(category, startChapter, limit) {
  if (isNaN(parseInt(startChapter))) {
    return "startChapter参数错误";
  }
  return db.find(category + "", {index: {$gte: parseInt(startChapter)}}, limit);
}

function getBookInfo(category, num) {
  // return db.find("biquku", {type: category + ""});
  let r1 = db.find("biquku", {type: category, num: num});
  // r.cover = setting.crawler_url + r.cover;
  return r1;
}

module.exports = router;
