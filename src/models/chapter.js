const mongoose = require('mongoose')

let ChapterSchema = new mongoose.Schema({
  title: String, // 章节标题
  url: String, // 章节的原始url
  index: Number, //本地章节码数
  content: String //章节内容
})

module.exports.schema = ChapterSchema
module.exports.model = function(name) {
  return mongoose.model(name, ChapterSchema)
}
