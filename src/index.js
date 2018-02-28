const router = require('koa-router')()
const crawler = require('./crawler-async.js')
const debug = require('debug')('chapter-one')
const setting = require('../setting.js')

router.get('/', async (ctx, next) => {
  ctx.res.setHeader('Access-Control-Allow-Origin', '*')
  ctx.res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  ctx.res.setHeader('Access-Control-Allow-Methods', 'GET')
  next()
})

router.get('/index', async (ctx, next) => {
  let res = await crawler.crawlerHomePage()
  ctx.body = res
})

// 根据分类查询分类书籍
router.get('/crawler/:category/:page', async (ctx, next) => {
  let r = await getCategory(ctx.params.category, ctx.params.page)
  ctx.body = r
})

router.get('/crawler/allbook', (ctx, next) => {
  crawler.crawlerAll('http://www.biquku.com/xiaoshuodaquan')
  ctx.body = '开始爬虫全部书籍'
})

router.get('/book/:category/:book', async (ctx, next) => {
  ctx.body = await crawler.crawlerBookDetail(
    ctx.params.category,
    ctx.params.book
  )
})

// 爬虫单个章节
router.get('/book/:category/:book/:chapter', async (ctx, next) => {
  // ctx.body = await crawler
  ctx.body = await crawler.crawlerChapter(
    ctx.params.category,
    ctx.params.book,
    ctx.params.chapter
  )
})

function getCategory(category, page) {
  // 先爬虫, 后续再从数据库读取
  return crawler.crawlerCategory(category, page)
}

//查询书籍信息
router.get('/:category/:num', async (ctx, next) => {
  if (ctx.params.category === 'book') {
    next()
    return
  }
  let r = await getBookInfo(ctx.params.category, ctx.params.num)
  ctx.body = r
})

// 取得章节
router.get('/book/:bookNum/:startChapter', async (ctx, next) => {
  if (ctx.params.bookNum === 'crawler') {
    next()
    return
  }
  ctx.body = await getChapter(
    ctx.params.bookNum,
    ctx.params.startChapter,
    ctx.query.count
  )
})

function getChapter(category, startChapter, limit) {
  if (isNaN(parseInt(startChapter))) {
    return 'startChapter参数错误'
  }
  return db.find(
    category + '',
    { index: { $gte: parseInt(startChapter) } },
    limit
  )
}

function getBookInfo(category, num) {
  return db.find('biquku', { type: category + '' })
  let r1 = db.find('biquku', { type: category, num: num })
  r.cover = setting.crawler_url + r.cover
  return r1
}

module.exports = router
