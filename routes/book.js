"use strict";
const router = require("koa-router")();
const debug = require("debug")("book");

router.get("/", function(ctx, next) {
  ctx.body = "开始";
});

module.exports = router;
