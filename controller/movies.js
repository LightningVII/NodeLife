'use strict'
/* eslint no-unused-vars: */
import { controller, get, log } from '../decorator/router'
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const userFields = ['avatar', 'nickname', 'gender', 'age', 'breed']
@controller('api/movies')
export default class {
  /**
   * @example http://localhost:4000/api/movies
   */
  @get('')
  @log
  async find (ctx, next) {
    const data = await Movie.find()
      .populate('author', userFields.join(' '))
      .sort({
        'meta.createAt': -1
      })
      .limit()
      .exec()

    const total = await Movie.find().count().exec()

    ctx.body = {
      success: true,
      data,
      total
    }
  }
}
