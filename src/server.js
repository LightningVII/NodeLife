import http from 'http'
import url from 'url'

const start = (route, handle) => {
  const onRequest = (req, res) => {
    let postData
    const pathname = url.parse(req.url).pathname
    req.setEncoding('utf8')

    req.addListener('data', postDataChunk => {
      postData += postDataChunk
      console.log("Received POST data chunk '" + postDataChunk + "'.")
    })
    req.addListener('end', function () {
      route(handle, pathname, res, postData)
    })
  }

  http.createServer(onRequest).listen(8080)
}

export default { start }
