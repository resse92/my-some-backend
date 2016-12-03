const mongoose = require("mongoose");

let BookSchema = new mongoose.Schema({
  type: Number, // 类型
  author: String, // 作者
  update_time: String, // 最新更新时间
  index: Number, // 书籍统计
  cover: String, // 封面
  name: String // 书名

});

module.exports.schema = BookSchema;
module.exports.model = function(name) {
  return mongoose.model(name, BookSchema);
};

