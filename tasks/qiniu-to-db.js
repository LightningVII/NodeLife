const qiniu = require('qiniu')
const mongoose = require('mongoose')
const nanoid = require('nanoid')
const config = require('../config')

const bucket = config.qiniu.bucket
const mac = new qiniu.auth.digest.Mac(config.qiniu.AK, config.qiniu.SK)
const cfg = new qiniu.conf.Config()
const client = new qiniu.rs.BucketManager(mac, cfg)

const Movie = mongoose.model('Movie')

const uploadToQiniu = async (url) => {
  return new Promise((resolve, reject) => {
    const key = `${nanoid()}.mp4`

    client.fetch(url, bucket, key, (err, ret, info) => {
      if (err) {
        reject(err)
      } else if (info.statusCode === 200) {
        resolve({ key })
      } else {
        reject(info)
      }
    })
  })
};
(async () => {
  const movies = await Movie.find({
    $or: [{ key: { $exists: false } }, { key: null }, { key: '' }]
  }).exec()

  movies.forEach(async (movie) => {
    const mv = movie
    if (mv.video && !mv.key) {
      try {
        const data = await uploadToQiniu(mv.video)

        if (data.key) {
          mv.key = data.key
          await mv.save()
        }
      } catch (err) {
        console.log(err)
      }
    }
  })
})()
