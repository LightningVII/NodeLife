import cp from 'child_process'
import mongoose from 'mongoose'
import { resolve } from 'path'

const Movie = mongoose.model('Movie');
(async () => {
  let invoked = false
  const script = resolve(__dirname, '../crawler/trailer-list')

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

    console.log(err || 'exit')
  })

  child.on('message', (data) => {
    const result = data.result
    result.forEach(async (item) => {
      let movie = await Movie.findOne({
        doubanId: item.doubanId
      }).exec()

      if (!movie) {
        movie = new Movie(item)
        await movie.save()
      }
    })
  })
})()
