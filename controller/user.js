'use strict';

var xss = require('xss');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var uuid = require('uuid');
var sms = require('../service/sms');

exports.signup = async (ctx, next) => {
    let phoneNumber = xss(ctx.request.body.phoneNumber.trim());

    let user = await User.findOne({
        phoneNumber: phoneNumber
    });

    let verifyCode = sms.getCode();

    if (!user) {
        let accessToken = uuid.v4();

        user = new User({
            nickname: '小狗宝',
            avatar: 'http://7xpwuf.com1.z0.glb.clouddn.com/WechatIMG13.jpeg',
            phoneNumber: xss(phoneNumber),
            verifyCode: verifyCode,
            accessToken: accessToken
        });
    } else {
        user.verifyCode = verifyCode;
    }

    try {
        user = await user.save();
    } catch (e) {
        ctx.body = {
            success: false
        };

        return next;
    }

    let msg = '您的注册验证码是：' + user.verifyCode;

    try {
        // await sms.send(user.phoneNumber, msg)
        console.log(user.phoneNumber, msg);
    } catch (e) {
        console.log(e);

        return (ctx.body = {
            success: false,
            err: '短信服务异常'
        });
    }

    ctx.body = {
        success: true
    };
};

exports.verify = async (ctx, next) => {
    let verifyCode = ctx.request.body.verifyCode;
    var phoneNumber = ctx.request.body.phoneNumber;
    if (!verifyCode || !phoneNumber) {
        ctx.body = {
            success: false,
            err: '验证没通过'
        };

        return next;
    }

    var user = await User.findOne({
        phoneNumber: phoneNumber,
        verifyCode: verifyCode
    });
    console.log(user);
    if (user) {
        user.verified = true;
        user = await user.save();

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
        };
    } else {
        ctx.body = {
            success: false,
            err: '验证未通过'
        };
    }
};

exports.update = async (ctx, next) => {
    var body = ctx.request.body;
    var user = ctx.session.user;
    console.log(body);
    var fields = 'avatar,gender,age,nickname,breed'.split(',');

    fields.forEach(function(field) {
        if (body[field]) {
            user[field] = xss(body[field].trim());
        }
    });

    user = await user.save();

    ctx.body = {
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
    };
};
