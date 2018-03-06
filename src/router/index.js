import Router from 'koa-router'
import book from '../controller/zhuishushenqi/book'
import category from '../controller/zhuishushenqi/category'
import comment from '../controller/zhuishushenqi/comment'
import rank from '../controller/zhuishushenqi/rank'
const debug = require('debug')('zhuishushenqi')
const router = new Router({
  prefix: '/zhuishushenqi'
})
// 获取带书籍数量大分类
router.get('/categories-with-count', category.getCategoriesWithBookCount)
// router.get('/categories-with-count', )

// 获取带子分类的分类
router.get('/categories-with-sub', category.getCategoriesWithSubCategories)

// 获取分类详情
router.get('/categories/detail', category.getCategoryInfo)

// 获取书籍详情 id: bookid
router.get('/book/:id', book.getBookInfo)

// 获取书籍相关推荐
router.get('/recommend/:id', book.getRelatedRecommendedBooks)

// 获取书籍热评
// router.get('/comments/:id', comment.getHotComments)

// 获取作者名下的书籍
router.get('/author/books/:author', book.getAuthorBooks)

// 获取书籍章节 id: 书源id
router.get('/book/:id/chapters/', book.getBookChapters)

// 获取章节详细内容
router.get('/chapters/:link', book.getChapterContent)

// 获取搜索结果
router.get('/search', book.getBookSearchResults)

// 获取书籍源
router.get('/book/:id/sources', book.getBookSources)

// 获取排名分类
router.get('/rank/category', rank.getRankCategory)

// 获取排名详情
router.get('/rank/:id', rank.getRankInfo)

// 获取书籍讨论
router.get('/book/discussions', comment.getBookComments)

// 获取书籍短评
router.get('/book/short-reviews', comment.getBookShortReviews)

// 获取长书评
router.get('/book/reviews', comment.getBookReviews)

// 获取书单列表
router.get('/booklists', book.getLists)

// 获取书单详情
router.get('/booklists/:id', book.getListDetail)

module.exports = router
