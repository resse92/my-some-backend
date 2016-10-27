"use strict";
const router = require("koa-router")();
const crawler = require("../src/crawler/crawler.js");

router.get("/", function(ctx, next) {
  ctx.body = "this /1!";
  crawler();
});

router.get("/2", function(ctx, next) {
  ctx.body = "this /2!";
});

module.exports = router;
