const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();
const filesDirectory = '/files/';

function handleError(err, res) {
  if (err.code === 'ENOENT') {
    res.statusCode = 404;
    res.end();
    return;
  }
  res.statusCode = 500;
  res.end();
}

function getFile(pathname, res) {
  if (~pathname.indexOf('/')) {
    res.statusCode = 400;
    res.end();
    return;
  }

  const filePath = path.join(__dirname, filesDirectory, pathname);

  const readStream = fs.createReadStream(filePath);

  readStream.on('error', (err) => handleError(err,res));

  readStream
      .pipe(res)
      .on('error', (err) => handleError(err,res));
}

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      getFile(pathname, res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
