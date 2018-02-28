const router = require('koa-router')()

router.get('/', function(next) {
  this.body = 'this /book!'
})

module.exports = router
