import cp from 'child_process'
import { resolve } from 'path'
import mongoose from 'mongoose'
// import schedule from 'node-schedule';

const Movie = mongoose.model('Movie');

// schedule.scheduleJob('18 * * *', async () => {
(async () => {
  const movies = await Movie.find({
    $or: [{ video: { $exists: false } }, { video: null }]
  }).exec()

  let invoked = false
  const script = resolve(__dirname, '../crawler/trailer')
  const child = cp.fork(script, [])

  child.on('error', (err) => {
    if (invoked) return
    invoked = true

    console.log(err)
  })

  child.on('exit', (code) => {
    if (invoked) return
    invoked = false
    const err = code === 0 ? null : new Error(`exit code ${code}`)

    console.log(err)
  })

  child.on('message', async (data) => {
    const doubanId = data.doubanId
    const movie = await Movie.findOne({
      doubanId
    }).exec()

    if (data.video) {
      movie.video = data.video
      movie.cover = data.cover

      await movie.save()
    } else {
      await movie.remove()
    }
  })

  child.send(movies)
})()

// })
