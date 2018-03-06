'use strict'

require('babel-register') //加入babel hook
require('babel-polyfill')
const serve = require('koa-static')
const Koa = require('koa')
const app = new Koa()
const path = require('path')

const favicon = require('koa-favicon')
const compress = require('koa-compress') //好像是用来压缩的
const conditional = require('koa-conditional-get') //缓存,如果上次get请求过而数据没用改变,则直接返回
const etag = require('koa-etag') // 配合上个使用的
const views = require('koa-views')
const setting = require('./setting.js')
const debug = require('debug')('app')
const crawlerRouter = require('./src/router/crawler')
const zhuishushenqiRouter = require('./src/router/index')
const convert = require('koa-convert')
const cors = require('koa-cors')
const Redis = require('ioredis')

// ---------- override app.use method  middleware migrate to v2.x----------
const _use = app.use
app.use = x => _use.call(app, convert(x))
// ---------- override app.use method end ----------

// Must be used before any router is used
app.use(serve(path.join(__dirname, 'public')))
app.use(
  compress({
    filter: function(content_type) {
      return /text/i.test(content_type)
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
  })
)
// 设置跨域
app.use(cors({
  origin: function(ctx) {
    return '*'
  },
  allowedMethods: ['GET']
}))

// redis
// const redis = new Redis({
//   host: '127.0.0.1',
//   port: 6379,
//   prefix: 'novelcrawler:',
//   ttl: 60 * 60 * 23,
//   db: 0
// })

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

//e-tag works together with conditional-get
app.use(conditional())
app.use(etag())

//or use absolute path
app.on('error', function(err, ctx) {
  debug('server error', err, ctx)
})

app.use(zhuishushenqiRouter.routes()).use(zhuishushenqiRouter.allowedMethods())
app.use(crawlerRouter.routes()).use(crawlerRouter.allowedMethods())
app.listen(setting.port)
