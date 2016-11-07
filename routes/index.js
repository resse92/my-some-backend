"use strict";
const router = require("koa-router")();
const crawler = require("./crawler.js");
const db = require("./db.js");
const debug = require("debug")("chapter-one");

router.get("/", (ctx, next) => {
  debug("开始");
  ctx.body = "接收到了";
});

//根据分类查询分类书籍
router.get("/:category", async (ctx, next) => {
  let r = await getCategory(0);
  ctx.body = r;
});

router.get("/:category/:book",async (ctx, next) => {
  ctx.body = await getBookInfo(1);
});

router.get("/crawler/allbook", (ctx, next) => {
  crawler();
  ctx.body = "开始爬虫全部书籍";
});

function getCategory(category) {
  // return db.find("biquku", {type: category + ""});
  return db.find("biquku", {type: "0"});
}

function getBookInfo(category) {
  return db.find(category + "", {});
}

module.exports = router;
