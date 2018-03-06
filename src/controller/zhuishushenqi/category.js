import axios from 'axios'
import book from '../../zhuishushenqi'

class Category {
  //获取父分类以及书籍数量
  async getCategoriesWithBookCount (ctx) {
    const categories = await axios.get(book.category.categoryWithBookCount)
    ctx.body = categories.data
  }

  // 获取父分类以及子分类
  async getCategoriesWithSubCategories (ctx) {
    const subCategories = await axios.get(book.category.categoryWithSubCategories)
    ctx.body = subCategories.data
  }

  // 获取分类下的书籍信息
    async getCategoryInfo (ctx) {
    if (!Object.keys(ctx.query).length) {
      ctx.throw(400, new Error('you must pass some query string: { gender, type, major, minor, start, limit }'))
    }
    const categoriesInfo = await axios.get(book.category.categoryInfo, { params: ctx.query })
    ctx.body = categoriesInfo.data
  }
}

export default new Category()
