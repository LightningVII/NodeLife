'use strict'

const qiniu = require('qiniu')
const cloudinary = require('cloudinary')
const Promise = require('bluebird')
const sha1 = require('sha1')
const uuid = require('uuid')
const config = require('../config/config')

cloudinary.config(config.cloudinary)

exports.getQiniuToken = body => {
  const { qiniu: { BUCKET, AK, SK } } = config
  const mac = new qiniu.auth.digest.Mac(AK, SK)
  const type = body.type
  let key = uuid.v4()

  const scope = key => `${BUCKET}:${key}`

  if (type === 'avatar') {
    key += '.jpeg'
  } else if (type === 'video') {
    key += '.mp4'
        // options.persistentOps = 'avthumb/mp4/an/1';
  } else if (type === 'audio') {
    key += '.aac'
        // options.persistentOps = 'avthumb/acodec/aac';
  }
  const options = {
    scope: scope(key)
  }

  const putPolicy = new qiniu.rs.PutPolicy(options)

  const token = putPolicy.uploadToken(mac)

  return {
    key,
    token
  }
}

exports.saveToQiniu = async (url, key) => {
  const client = new qiniu.rs.Client()
  const BUCKET = config.qiniu.BUCKET
  const data = await client.fetch(url, BUCKET, key)
  return data
}

exports.uploadToCloudinary = function (url) {
  return new Promise(function (resolve, reject) {
    cloudinary.uploader.upload(
            url,
            function (result) {
              if (result && result.public_id) {
                resolve(result)
              } else {
                reject(result)
              }
            },
      {
        resource_type: 'video',
        folder: 'video'
      }
        )
  })
}

exports.getCloudinaryToken = function (body) {
  const type = body.type
  const timestamp = body.timestamp
  let folder, tags

  if (type === 'avatar') {
    folder = 'avatar'
    tags = 'app,avatar'
  } else if (type === 'video') {
    folder = 'video'
    tags = 'app,video'
  } else if (type === 'audio') {
    folder = 'audio'
    tags = 'app,audio'
  }

    // data.data
  let signature =
        'folder=' +
        folder +
        '&tags=' +
        tags +
        '&timestamp=' +
        timestamp +
        config.cloudinary.api_secret
  const key = uuid.v4()

  signature = sha1(signature)

  return {
    token: signature,
    key: key
  }
}
