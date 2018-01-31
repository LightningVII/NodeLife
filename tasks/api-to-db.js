import mongoose from 'mongoose'
// import schedule from 'node-schedule';
import rp from 'request-promise-native'

const Movie = mongoose.model('Movie')

async function fetchMovie (item) {
  const url = `https://api.douban.com/v2/movie/${item.doubanId}`
  const res = await rp(url)

  return JSON.parse(res)
}

(async () => {
  // schedule.scheduleJob('18 * * *', () => {

  const movies = await Movie.find({
    $or: [{ summary: { $exists: false } }, { summary: null }, { summary: '' }]
  }).exec()
  movies.forEach(async (movie) => {
    const mv = movie
    const movieData = await fetchMovie(movie)
    const tags = movieData.tags || []

    mv.tags = []
    mv.summary = movieData.summary || ''
    tags.forEach((tag) => {
      mv.tags.push(tag.name)
    })

    await mv.save()
  })
})()
