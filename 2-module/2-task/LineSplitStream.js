const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const delimiter = os.EOL;

    if (~this.buffer.indexOf(delimiter)) {
      const bufferWithDelimiter = this.buffer.split(delimiter);

      const [remainder, ...dataToSend] = bufferWithDelimiter.reverse();

      dataToSend.forEach(string => {
        this.push(string);
      });

      this.buffer = remainder;
    }
    callback();
  }

  _flush(callback) {
    this.push(this.buffer);
    callback();
  }
}

module.exports = LineSplitStream;
