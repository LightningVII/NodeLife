'use strict'
/* eslint no-unused-vars: */
import { controller, get, post, log, required, session } from '../decorator/router'
const xss = require('xss')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const uuid = require('uuid')
const sms = require('../service/sms')

/**
 * @example fetch('/api/user/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phoneNumber: '17612179125'
    })
  })
 */

@controller('api/user')
export default class {
  @post('signup')
  @log
  @required({
    body: ['phoneNumber']
  })
  async signup (ctx, next) {
    let phoneNumber = xss(ctx.request.body.phoneNumber.trim())

    let user = await User.findOne({
      phoneNumber: phoneNumber
    })

    let verifyCode = sms.getCode()

    if (!user) {
      let accessToken = uuid.v4()

      user = new User({
        nickname: '匿名',
        avatar: 'http://7xpwuf.com1.z0.glb.clouddn.com/WechatIMG13.jpeg',
        phoneNumber: xss(phoneNumber),
        verifyCode: verifyCode,
        accessToken: accessToken
      })
    } else {
      user.verifyCode = verifyCode
    }

    try {
      user = await user.save()
    } catch (e) {
      ctx.body = {
        success: false
      }

      return next
    }

    let msg = '您的注册验证码是：' + user.verifyCode

    try {
      // await sms.send(user.phoneNumber, msg)
      console.log(user.phoneNumber, msg)
    } catch (e) {
      console.log(e)

      return (ctx.body = {
        success: false,
        err: '短信服务异常'
      })
    }

    ctx.body = {
      success: true
    }
  }

/**
 * @example fetch('/api/user/verify', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      verifyCode: '3411',
      phoneNumber: '17612179125'
    })
  }) */
  @post('verify')
  @log
  @required({
    body: ['phoneNumber', 'verifyCode']
  })
  async verify (ctx, next) {
    let verifyCode = ctx.request.body.verifyCode
    var phoneNumber = ctx.request.body.phoneNumber
    if (!verifyCode || !phoneNumber) {
      ctx.body = {
        success: false,
        err: '验证没通过'
      }

      return next
    }

    var user = await User.findOne({
      phoneNumber: phoneNumber,
      verifyCode: verifyCode
    })
    if (user) {
      user.verified = true
      ctx.session.user = user
      user = await user.save()

      ctx.body = {
        success: true,
        data: {
          nickname: user.nickname,
          accessToken: user.accessToken,
          avatar: user.avatar,
          _id: user._id,
          gender: user.gender,
          age: user.age,
          breed: user.breed
        }
      }
    } else {
      ctx.body = {
        success: false,
        err: '验证未通过'
      }
    }
  }

  /**
  * @example fetch('/api/user/update', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phoneNumber: '17612179126',
      age: '26',
      accessToken: 'f7924b77-d12d-403e-ba25-3c8ef99b21a3'
    })
  }) */
  @post('update')
  @log
  @required({
    body: ['phoneNumber']
  })
  @session({
    user: ['accessToken']
  })
  async update (ctx, next) {
    const user = await User.findOne({
      accessToken: ctx.session.user.accessToken
    })
    const body = ctx.request.body
    const fields = 'avatar,gender,age,nickname,breed'.split(',')
    fields.forEach(function (field) {
      if (body[field]) {
        user[field] = xss(body[field].trim())
      }
    })
    ctx.body = {
      success: true,
      data: await user.save()
    }
  }
}
