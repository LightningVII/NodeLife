import querystring from 'querystring'
import formidable from 'formidable'
import util from 'util'
import fs from 'fs'

const form = new formidable.IncomingForm()

const start = res => {
  console.log("Request handler 'start' was called.")
  var body =
    '<html>' +
    '<head>' +
    '<meta http-equiv="Content-Type" content="text/html; ' +
    'charset=UTF-8" />' +
    '</head>' +
    '<body>' +
    '<form action="/upload" method="post">' +
    '<textarea name="text" rows="20" cols="60"></textarea>' +
    '<input type="submit" value="Submit text" />' +
    '</form>' +
    '</body>' +
    '</html>'
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.write(body)
  res.end()
}

const upload = (res, postData) => {
  console.log("Request handler 'upload' was called.")
  form.parse(postData, (err, fields, files) => {
    err && console.log(err)
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.write('received upload:\n\n')
    res.end(util.inspect({ fields: fields, files: files }))
  })
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.write("You've sent the text: " + querystring.parse(postData).text)
  res.end()
}

const show = res => {
  console.log("Request handler 'show' was called.")
  fs.readFile('/tmp/test.png', 'binary', (error, file) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.write(error + '\n')
      res.end()
    } else {
      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.write(file, 'binary')
      res.end()
    }
  })
}

export { start, upload, show }
