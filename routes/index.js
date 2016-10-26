"use strict";
const router = require("koa-router")();
const debug = require("debug")("test");

router.get("/", function(ctx, next) {
    ctx.body = "this /1!";
    debug("test");
});

router.get("/2", function(ctx, next) {
    ctx.body = "this /2!";
});

module.exports = router;
