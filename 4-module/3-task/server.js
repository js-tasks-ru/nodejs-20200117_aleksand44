const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

function deleteFile(req,res) {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  if (~pathname.indexOf('/')) {
    res.statusCode = 400;
    res.end('вложенные пути запрещены');
    return;
  }

  fs.unlink(filepath, (err) => {
    if (!err) {
      res.statusCode = 200;
      res.end('alright');
    }
    else {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('такого файла на диске нет');
        return;
      }
      res.statusCode = 500;
      res.end('server error');
    }
  });
}

server.on('request', (req, res) => {
  switch (req.method) {
    case 'DELETE':
      deleteFile(req, res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
