'use strict'
const { resolve } = require('path')

const host = process.env.HOST || 'localhost'
const env = process.env.NODE_ENV || 'development'
const conf = require(resolve(__dirname, `./${env}.json`))

/* module.exports = Object.assign({
  env,
  host
}, conf) */

module.exports = {
  qiniu: {
    video: 'http://video.iblack7.com/',
    AK: '3kpt23kEYXzoxodBU2Lb0TIp4wlAqrEmC1t_LrvT',
    SK: 'qA7h6spIUhHKK785vgJmmpaMbwtyy5DkV1PHCKP_',
    BUCKET: 'expertscowry'
  },
  cloudinary: {
    cloud_name: 'gougou',
    api_key: '852224485571877',
    api_secret: 'xxx',
    base: 'http://res.cloudinary.com/gougou',
    image: 'https://api.cloudinary.com/v1_1/gougou/image/upload',
    video: 'https://api.cloudinary.com/v1_1/gougou/video/upload',
    audio: 'https://api.cloudinary.com/v1_1/gougou/raw/upload'
  }
}
