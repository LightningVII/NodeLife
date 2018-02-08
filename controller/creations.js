'use strict'
/* eslint no-unused-vars: */
import { controller, get, post, log, required, session } from '../decorator/router'
const _ = require('lodash')
const qiniu = require('qiniu')
const mongoose = require('mongoose')
const Video = mongoose.model('Video')
const Audio = mongoose.model('Audio')
const Creation = mongoose.model('Creation')
const xss = require('xss')
const robot = require('../service/robot')
const conf = require('../config')
const userFields = ['avatar', 'nickname', 'gender', 'age', 'breed']

exports.up = async (ctx, next) => {
  const body = ctx.request.body
  const user = ctx.session.user
  const creation = await Creation.findOne({
    _id: body.id
  }).exec()

  if (!creation) {
    ctx.body = {
      success: false,
      err: '视频找不到了！'
    }

    return next
  }

  if (body.up === 'yes') {
    creation.votes.push(String(user._id))
  } else {
    creation.votes = _.without(creation.votes, String(user._id))
  }

  creation.up = creation.votes.length

  await creation.save()

  ctx.body = {
    success: true
  }
}

async function asyncMedia (videoId, audioId) {
  if (!videoId) return
  let query = {
    _id: audioId
  }

  if (!audioId) {
    query = {
      video: videoId
    }
  }

  const video = await Video.findOne({ _id: videoId }).exec()
  const audio = await Audio.findOne(query).exec()

  console.log('====video===', video)
  console.log('====audio===', audio)

  // const videoURL =
  //     'http://res.cloudinary.com/gougou/video/upload/e_volume:-100/e_volume:400,l_video:' +
  //     audioPublicId +
  //     '/' +
  //     videoPublicId +
  //     '.mp4';

  // robot
  //     .saveToQiniu(videoURL, videoName)
  //     .catch(function(err) {
  //         console.log(err);
  //     })
  //     .then(function(response) {
  //         if (response && response.key) {
  //             audio.qiniu_video = response.key;
  //             audio.save().then(function(_audio) {
  //                 Creation.findOne({
  //                     video: video._id,
  //                     audio: audio._id
  //                 })
  //                     .exec()
  //                     .then(function(_creation) {
  //                         if (_creation) {
  //                             if (!_creation.qiniu_video) {
  //                                 _creation.qiniu_video = _audio.qiniu_video;
  //                                 _creation.save();
  //                             }
  //                         }
  //                     });
  //                 console.log(_audio);
  //                 console.log('同步视频成功');
  //             });
  //         }
  //     });

  const { qiniu: { BUCKET, AK, SK } } = conf

  const mac = new qiniu.auth.digest.Mac(AK, SK)
  const config = new qiniu.conf.Config()
  config.zone = qiniu.zone.Zone_z0
  const operManager = new qiniu.fop.OperationManager(mac, config)
  const saveBucket = BUCKET
  const qiniuKey = video.qiniu_key
  const thumb = qiniuKey.substr(0, qiniuKey.indexOf('.'))

  const fops = [
    'vframe/jpg/offset/1|saveas/' +
      qiniu.util.urlsafeBase64Encode(saveBucket + ':' + thumb + '-thumb.jpg')
  ]
  const pipeline = 'whiteace'
  const srcBucket = BUCKET
  const srcKey = qiniuKey
  const options = {
    force: true
  }
  // 持久化数据处理返回的是任务的persistentId，可以根据这个id查询处理状态
  operManager.pfop(srcBucket, srcKey, fops, pipeline, options, function (
    err,
    respBody,
    respInfo
  ) {
    if (err) {
      throw err
    }
    if (respInfo.statusCode === 200) {
      Creation.findOne({
        video: video._id,
        audio: audio._id
      })
        .exec()
        .then(data => {
          if (!data.qiniu_thumb) {
            data.qiniu_thumb = thumb + '-thumb.jpg'
            data.save()
          }
        })
    } else {
      console.log(respInfo.statusCode)
      console.log(respBody)
    }
  })
}

@controller('api/creation')
export default class {
  @get('')
  @log
  async find (ctx, next) {
    const feed = ctx.query.feed
    const cid = ctx.query.cid
    const count = 5
    const query = {
      finish: 100
    }

    if (cid) {
      if (feed === 'recent') {
        query._id = { $gt: cid }
      } else {
        query._id = { $lt: cid }
      }
    }

    const data = await Creation.find()
      .sort({
        'meta.createAt': -1
      })
      .limit(count)
      .populate('video', 'qiniu_key')
      .populate('author', userFields.join(' '))
      .populate('audio', 'detail')
      .exec()

    const total = await Creation.count().exec()
    console.log('---', total)
    ctx.body = {
      success: true,
      data,
      total
    }
  }

  @get('test')
  @log
  async test (ctx, next) {
    const audioId = '5a3cbdfec78ef4059545b2f7'
    const videoId = '5a3cb1c0c78ef4059545b2f6'
    asyncMedia(videoId, audioId)

    ctx.body = {
      success: true,
      data: audioId
    }
  }

  @post('')
  @log
  @required({
    body: ['phoneNumber']
  })
  @session({
    user: ['accessToken']
  })
  async save (ctx, next) {
    const body = ctx.request.body
    const videoId = body.videoId
    const audioId = body.audioId
    const title = body.title
    const user = ctx.session.user

    const video = await Video.findOne({
      _id: videoId
    }).exec()
    const audio = await Audio.findOne({
      _id: audioId
    }).exec()

    if (!video || !audio) {
      ctx.body = {
        success: false,
        err: '音频或者视频素材不能为空'
      }

      return next
    }

    let creation = await Creation.findOne({
      audio: audioId,
      video: videoId
    }).exec()

    if (!creation) {
      const creationData = {
        author: user._id,
        title: xss(title),
        audio: audioId,
        video: videoId,
        finish: 20
      }

      const videoPublicId = video.public_id
      const audioPublicId = audio.public_id

      if (videoPublicId && audioPublicId) {
        creationData.cloudinary_thumb =
          'http://res.cloudinary.com/gougou/video/upload/' +
          videoPublicId +
          '.jpg'
        creationData.cloudinary_video =
          'http://res.cloudinary.com/gougou/video/upload/e_volume:-100/e_volume:400,l_video:' +
          audioPublicId.replace(/\//g, ':') +
          '/' +
          videoPublicId +
          '.mp4'

        creationData.finish += 20
      }

      if (audio.qiniu_thumb) {
        creationData.qiniu_thumb = audio.qiniu_thumb

        creationData.finish += 30
      }

      if (audio.qiniu_video) {
        creationData.qiniu_video = audio.qiniu_video

        creationData.finish += 30
      }

      creation = new Creation(creationData)
    }

    creation = await creation.save()

    console.log(creation)

    ctx.body = {
      success: true,
      data: {
        _id: creation._id,
        finish: creation.finish,
        title: creation.title,
        qiniu_thumb: creation.qiniu_thumb,
        qiniu_video: creation.qiniu_video,
        author: {
          avatar: user.avatar,
          nickname: user.nickname,
          gender: user.gender,
          breed: user.breed,
          _id: user._id
        }
      }
    }
  }

  @post('audio')
  @log
  @required({
    body: ['phoneNumber']
  })
  @session({
    user: ['accessToken']
  })
  async audio (ctx, next) {
    const body = ctx.request.body
    const audioData = body.audio
    const videoId = body.videoId
    const user = ctx.session.user

    // if (!audioData || !audioData.public_id) {
    //     ctx.body = {
    //         success: false,
    //         err: '音频没有上传成功！'
    //     };

    //     return next;
    // }

    let audio = await Audio.findOne({
      public_id: audioData.public_id
    }).exec()

    const video = await Video.findOne({
      _id: videoId
    }).exec()

    console.log(video)

    if (!audio) {
      const _audio = {
        author: user._id,
        public_id: audioData.public_id,
        detail: audioData
      }

      if (video) {
        _audio.video = video._id
      }

      audio = new Audio(_audio)
      audio = await audio.save()
    }

    // 异步操作
    asyncMedia(video._id, audio._id)

    ctx.body = {
      success: true,
      data: audio._id
    }
  }

  @post('video')
  @log
  @required({
    body: ['phoneNumber']
  })
  @session({
    user: ['accessToken']
  })
  async video (ctx, next) {
    const body = ctx.request.body
    const videoData = body.video
    const user = ctx.session.user

    if (!videoData || !videoData.key) {
      ctx.body = {
        success: false,
        err: '视频没有上传成功！'
      }

      return next
    }

    let video = await Video.findOne({
      qiniu_key: videoData.key
    }).exec()

    if (!video) {
      video = new Video({
        author: user._id,
        qiniu_key: videoData.key,
        persistentId: videoData.persistentId
      })

      video = await video.save()
    }

    const url = global.config.qiniu.video + video.qiniu_key

    robot.uploadToCloudinary(url).then(function (data) {
      if (data && data.public_id) {
        video.public_id = data.public_id
        video.detail = data

        video.save().then(function (_video) {
          asyncMedia(_video._id)
        })
      }
    })

    ctx.body = {
      success: true,
      data: video._id
    }
  }
}
