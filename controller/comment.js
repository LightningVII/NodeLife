'use strict'
const mongoose = require('mongoose')
const Comment = mongoose.model('Comment')
const Creation = mongoose.model('Creation')

const userFields = ['avatar', 'nickname', 'gender', 'age', 'breed']

exports.find = async (ctx, next) => {
  const { feed, cid, id } = ctx.query
  const count = 5
  const query = {
    creation: cid
  }

  if (!cid) {
    return (ctx.body = {
      success: false,
      err: 'id 不能为空'
    })
  }

  if (id) {
    if (feed === 'recent') {
      query._id = { $gt: id }
    } else {
      query._id = { $lt: id }
    }
  }

  const data = await Comment.find(query)
        .populate('replyBy', userFields.join(' '))
        .sort({
          'meta.createAt': -1
        })
        .limit(count)
        .exec()

  const total = await Comment.find(query)

  ctx.body = {
    success: true,
    data,
    total
  }
}

exports.save = async (ctx, next) => {
  const commentData = ctx.request.body.comment
  console.log(commentData)
  const user = ctx.session.user
  const creation = await Creation.findOne({
    _id: commentData.creation
  }).exec()

  console.log(commentData.creation)
  console.log(commentData)

  if (!creation) {
    ctx.body = {
      success: false,
      err: '视频不见了'
    }

    return next
  }

  let comment

  if (commentData.cid) {
    comment = await Comment.findOne({
      _id: commentData.cid
    }).exec()

    const reply = {
      from: commentData.from,
      to: commentData.tid,
      content: commentData.content
    }

    comment.reply.push(reply)

    comment = await comment.save()
  } else {
    comment = new Comment({
      creation: creation._id,
      replyBy: user._id,
      replyTo: creation.author,
      content: commentData.content
    })

    comment = await comment.save()
  }

  const data = await Comment.find({
    creation: creation._id
  })
        .populate('replyBy', userFields.join(' '))
        .sort({
          'meta.createAt': -1
        })
        .exec()

  const total = await Comment.count({ creation: creation._id }).exec()

  ctx.body = {
    success: true,
    data,
    total
  }
}
