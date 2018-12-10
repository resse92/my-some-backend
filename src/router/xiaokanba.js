import Router from 'koa-router'
import Debug from 'debug'
import axios from 'axios'
const debug = Debug('xiaokanba')
const baseUrl = 'http://app.xiaokanba.com/newmovie/'
// const baseParameters = '_=1544355750375&token=2CDDFA7F0FC325274BDDB95DB7882E34&type=0'
const router = new Router({
  prefix: '/xiaokanba'
})

router.get('/hot-play', async (ctx, next) => {
  const res = await axios.get( baseUrl + 'api/hotPlay')
  console.log(res)
  debug(res)
  ctx.body = res.data
})

router.get('/video/:id', async (ctx, next) => {
  const res = await axios.get(baseUrl + 'api/video',{
    params: {
      videoId: ctx.params.id
    }
  })
  ctx.body = res.data
})

router.get('/video/:id/source/:name/:type', async (ctx, next) => {
  const res = await axios.get(baseUrl + 'api/videosource', {
    params: {
      movieId: ctx.params.id,
      name: ctx.params.name,
      type: ctx.params.type
    }
  })
  ctx.body = res.data
})

module.exports = router