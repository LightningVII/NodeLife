'use strict'

var xss = require('xss')
var mongoose = require('mongoose')
var User = mongoose.model('User')
var uuid = require('uuid')
var sms = require('../service/sms')

exports.signup = async(ctx, next) => {
    let phoneNumber = xss(ctx.query.phoneNumber.trim())

    // let phoneNumber = xss(ctx.request.body.phoneNumber.trim())

    let user = await User.findOne({
        phoneNumber: phoneNumber
    }).exec()

    let verifyCode = sms.getCode()

    if (!user) {
        let accessToken = uuid.v4()

        user = new User({
            nickname: '小狗宝',
            avatar: 'http://res.cloudinary.com/gougou/image/upload/mooc1.png',
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
        await sms.send(user.phoneNumber, msg)
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

exports.verify = function*(next) {
    let verifyCode = this.request.body.verifyCode
    var phoneNumber = this.request.body.phoneNumber

    if (!verifyCode || !phoneNumber) {
        this.body = {
            success: false,
            err: '验证没通过'
        }

        return next
    }

    var user = yield User.findOne({
        phoneNumber: phoneNumber,
        verifyCode: verifyCode
    }).exec()

    if (user) {
        user.verified = true
        user = yield user.save()

        this.body = {
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
        this.body = {
            success: false,
            err: '验证未通过'
        }
    }
}

exports.update = function*(next) {
    var body = this.request.body
    var user = this.session.user
    var fields = 'avatar,gender,age,nickname,breed'.split(',')

    fields.forEach(function(field) {
        if (body[field]) {
            user[field] = xss(body[field].trim())
        }
    })

    user = yield user.save()

    this.body = {
        success: true,
        data: {
            nickname: user.nickname,
            accessToken: user.accessToken,
            avatar: user.avatar,
            age: user.age,
            breed: user.breed,
            gender: user.gender,
            _id: user._id
        }
    }
}