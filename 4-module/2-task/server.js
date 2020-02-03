const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

function createFile(req, res) {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);
  let body = [];

  if (~pathname.indexOf('/')) {
    res.statusCode = 400;
    res.end('вложенные пути запрещены');
    return;
  }

  req
      .on('data', (data) => body.push(data))
      .on('end', () => {
        body = Buffer.concat(body).toString();

        const writableStream = fs.createWriteStream(filepath, {flags: 'wx'});

        writableStream.on('error', (err) => {
          console.log('err', err);
          if (err.code === 'EEXIST') {
            res.statusCode = 409;
            res.end('данный фыйл уже существует');
            return;
          }
          fs.unlink(filepath);
          res.statusCode = 500;
          res.end('серверная ошибка');
        });
        writableStream.on('finish', () => {
          res.statusCode = 201;
          res.end('alright');
        });

        writableStream.write(body);
        writableStream.end();
      });
}

server.on('request', (req, res) => {
  switch (req.method) {
    case 'POST':
      createFile(req, res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
