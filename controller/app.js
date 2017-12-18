'use strict';

var mongoose = require('mongoose');
var uuid = require('uuid');
var User = mongoose.model('User');
var robot = require('../service/robot');

exports.signature = async (ctx, next) => {
    var body = ctx.request.body;
    var cloud = body.cloud;
    var data;
    
    if (cloud === 'qiniu') {
        data = robot.getQiniuToken(body);
    } else {
        data = robot.getCloudinaryToken(body);
    }

    ctx.body = {
        success: true,
        data: data
    };
};

exports.hasBody = async (ctx, next) => {
    var body = ctx.request.body || {};
    if (Object.keys(body).length === 0) {
        ctx.body = {
            success: false,
            err: '是不是漏掉什么了'
        };

        return next;
    }

    await next();
};

exports.hasToken = async (ctx, next) => {
    var accessToken = ctx.query.accessToken;

    if (!accessToken) {
        accessToken = ctx.request.body.accessToken;
    }

    if (!accessToken) {
        ctx.body = {
            success: false,
            err: '钥匙丢了'
        };

        return next;
    }

    var user = await User.findOne({
        accessToken: accessToken
    });

    if (!user) {
        ctx.body = {
            success: false,
            err: '用户没登陆'
        };

        return next;
    }

    ctx.session = this.session || {};
    ctx.session.user = user;

    await next();
};
