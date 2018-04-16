import http from 'http'

const start = () => {
  const onRequest = (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.write('Hello World')
    res.end()
  }

  http.createServer(onRequest).listen(8080)
}

export default { start }
