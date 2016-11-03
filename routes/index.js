"use strict";
const router = require("koa-router")();
const crawler = require("./crawler.js");
const db = require("./db.js");
const debug = require("debug")("chapter-one");

router.get("/", (ctx, next) => {
  debug("here");
  ctx.body = getCategory(0);
});

//根据分类查询分类书籍
router.get("/:category", (ctx, next) => {
  debug("here");
  ctx.body = getCategory(0);
});

router.get("/:category/:book", (ctx, next) => {
  ctx.body = "getBook";
});

router.get("/crawler/allbook", (ctx, next) => {
  crawler();
  ctx.body = "开始爬虫全部书籍";
});

function getCategory(category) {
  db.find("biquku", {type: category + ""});
}

function getBookInfo(category, book) {
  db.find(category + "", {type: category, num: book});
}

module.exports = router;
