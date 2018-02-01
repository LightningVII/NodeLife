'use strict'
/* eslint no-unused-vars: */
import { controller, get, log } from '../decorator/router'
const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const { jd } = require('../config/agent_api')
const getUrl = params => {
  return jd.url + params + 'appkey=' + jd.appkey
}

@controller('api/jd')
export default class {
  @get('driver')
  @log
  async driver (ctx, next) {
    let json = {}
    const {
      type = 'c1',
      subject = 1,
      pagesize = 20,
      pagenum = 1,
      sort = 'normal'
    } = ctx.query
    const url =
      'jisuapi/driverexamQuery?type=' +
      type +
      '&subject=' +
      subject +
      '&pagesize=' +
      pagesize +
      '&pagenum=' +
      pagenum +
      '&sort=' +
      sort +
      '&'

    await request({
      method: 'GET',
      url: getUrl(url),
      json: true
    }).then(response => {
      json = response.body
    })
    ctx.body = JSON.stringify(json)
  }

  @get('news')
  @log
  async news (ctx, next) {
    let json = {}
    const { channel = '头条', start = 0, num = 10 } = ctx.query
    const url =
      'jisuapi/get?channel=' +
      encodeURI(channel) +
      '&start=' +
      start +
      '&num=' +
      num +
      '&'
    await request({
      method: 'GET',
      url: getUrl(url),
      json: true
    }).then(response => {
      json = response.body
    })
    ctx.body = JSON.stringify(json)
  }

  @get('channel')
  @log
  async channel (ctx, next) {
    let json = {}
    const url = 'jisuapi/channel?'
    await request({
      method: 'GET',
      url: getUrl(url),
      json: true
    }).then(response => {
      json = response.body
    })
    ctx.body = JSON.stringify(json)
  }
}
