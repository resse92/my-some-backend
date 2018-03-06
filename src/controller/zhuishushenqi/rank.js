import book from '../../zhuishushenqi'
import axios from 'axios'

class Rank {
  // 获取书籍分类
  async getRankCategory (ctx) {
    const rankCategoryData = await axios.get(book.rank.rankCategory)
    ctx.body = rankCategoryData.data
  }

  // 获取排名详情
  async getRankInfo (ctx) {
    const rankInfo = await axios.get(book.rank.rankInfo + `/${ctx.params.id}`)
    ctx.body = rankInfo.data
  }
}

export default new Rank()
