import mongoose from 'mongoose'
import config from '../config'

mongoose.Promise = Promise

export const connectDB = () => {
  return new Promise((resolve, reject) => {
    if (config.env === 'development') {
      mongoose.set('debug', true)
    }

    mongoose.connect(config.db, {
      useMongoClient: true
    })

    mongoose.connection.on('disconnected', () => {
      mongoose.connect(config.db, {
        useMongoClient: true
      })
    })

    mongoose.connection.on('error', err => {
      reject(err)
    })

    mongoose.connection.on('open', () => {
      resolve(mongoose.connections[0])
    })

    mongoose.connection.once('open', () => {
      console.log('Connected to MongoDB', config.db)
    })
  })
}

export const initAdmin = async () => {
  const User = mongoose.model('User')

  let user = await User.findOne({
    email: 'scott@imooc.com'
  }).exec()

  if (!user) {
    console.log('写入管理员数据')
    user = new User({
      phoneNumber: 17612179125,
      email: 'whiteace@yeah.net',
      password: '920125',
      role: 'admin'
    })

    await user.save()
  }
}
