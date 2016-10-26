"use strict";
const serve = require("koa-static");
const Koa = require("koa");
const app = new Koa();
const path = require("path");

const favicon = require("koa-favicon");
const compress = require("koa-compress");
const conditional = require("koa-conditional-get");
const etag = require("koa-etag");
const mount = require("mount-koa-routes");
const views = require("koa-views");
const setting = require("./setting.js");

// Must be used before any router is used
app.use(views(path.join(__dirname, "/views"), {
    extension: "jade"
}));

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
app.use(serve(path.join(__dirname, "dist")));
mount(app, path.join(__dirname, "routes"), true);
app.listen(setting.port);
