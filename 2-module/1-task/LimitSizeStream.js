const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.limit = options.limit;
    this.length = 0;
  }

  _transform(chunk, encoding, callback) {
    this.length += chunk.length;

    if (this.length <= this.limit) {
      this.push(chunk);
      callback();
    }
    else {
      const err = new LimitExceededError();
      callback(err);
    }
  }

  _flush(callback) {
    this.length = 0;
    callback();
  }
}

module.exports = LimitSizeStream;
