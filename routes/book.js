"use strict";
const router = require("koa-router")();
const debug = require("debug")("book");
const crawlerChapter = require("../src/crawler/chapter-one.js");

router.get("/", function(ctx, next) {
  ctx.body = "/book/0/330";
  crawlerChapter();
});

router.get("/:category/:book", function(ctx, next) {
  const category = ctx.params["category"];
  const book = ctx.params["book"];
  debug("start debug");
  require("../src/chapter-one.js")(category, book);

  // ctx.body = 'this /book/' + category + '/' + book

  debug("%s", ctx.app.faye);

  return ctx.render("books/index", {
    category: category,
    book: book
  });

  // ctx.body = 'this /book/' + category + '/' + book;
});

module.exports = router;
