"use strict";

require("babel-register");//加入babel hook
const serve = require("koa-static");
const Koa = require("koa");
const app = new Koa();
const path = require("path");

const favicon = require("koa-favicon");
const compress = require("koa-compress"); //好像是用来压缩的
const conditional = require("koa-conditional-get");//缓存,如果上次get请求过而数据没用改变,则直接返回
const etag = require("koa-etag");// 配合上个使用的
const views = require("koa-views");
const setting = require("./setting.js");
const debug = require("debug")("app");
const router = require("./routes/index.js");

// Must be used before any router is used
app.use(serve(path.join(__dirname, "public")));
app.use(compress({
  filter: function(content_type) {
    return (/text/i).test(content_type);
  },
  threshold: 2048,
  flush: require("zlib").Z_SYNC_FLUSH
}));

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

//e-tag works together with conditional-get
app.use(conditional());
app.use(etag());

//or use absolute path
app.on("error", function(err, ctx){
  debug("server error", err, ctx);
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(setting.port);
