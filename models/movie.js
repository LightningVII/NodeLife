'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
const {ObjectId} = Schema.Types
var MovieSchema = new Schema({
  title: String,
  doubanId: String,
  summary: String,
  rate: Number,
  tags: [String],
  poster: String,
  cover: String,
  video: String,
  key: String,
  author: {
    type: ObjectId,
    ref: 'User'
  },
  meta: {
    createAt: {
      type: Date,
      dafault: Date.now()
    },
    updateAt: {
      type: Date,
      dafault: Date.now()
    }
  }
})

module.exports = mongoose.model('Movie', MovieSchema)
