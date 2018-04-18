import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

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
    '<form action="/upload" enctype="multipart/form-data" method="post">' +
    '<input type="file" name="upload" multiple="multiple">' +
    '<input type="submit" value="Upload file" />' +
    '</form>' +
    '</body>' +
    '</html>'
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.write(body)
  res.end()
}

const upload = (res, req) => {
  console.log("Request handler 'upload' was called.")
  form.parse(req, (error, fields, files) => {
    error && console.log(error)
    console.log(files.upload.path)
    fs.renameSync(files.upload.path, path.join(__dirname, 'tmp/test1.png'))
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write('received image:<br/>')
    res.write("<img src='/show' />")
    res.end()
  })
}

const show = res => {
  console.log("Request handler 'show' was called.")
  fs.readFile(path.join(__dirname, 'tmp/test1.png'), 'binary', (error, file) => {
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
