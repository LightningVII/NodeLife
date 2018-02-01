'use strict'
/* eslint no-unused-vars: */
import { controller, get, log } from '../decorator/router'
const Promise = require('bluebird')
const request = Promise.promisify(require('request'))

@controller('api/douban')
export default class {
  @get('')
  @log
  async movie (ctx, next) {
    let json = {}
    await request({
      method: 'GET',
      url: 'http://api.douban.com/v2/movie/top250',
      json: true
    }).then(response => {
      json = response.body
    })
    ctx.body = JSON.stringify(json)
  }
}
