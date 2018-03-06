import axios from 'axios'
import book from '../../zhuishushenqi'

class Comment {
  async getBookComments (ctx) {
    const comments = await axios.get(book.comment.discussions, { params: ctx.query })
    ctx.body = comments.data
  }

  async getBookShortReviews (ctx) {
    const discussions = await axios.get(book.comment.shortReviews, { params: ctx.query })
    ctx.body = discussions.data
  }

  async getBookReviews (ctx) {
    const reviews = await axios.get(book.comment.bookReviews, { params: ctx.query })
    ctx.body = reviews.data
  }
}

export default new Comment()
