const isNumber = require('./isNumber');

function sum(a, b) {
  if (!isNumber(a) || !isNumber(b)) {
    throw new TypeError('one of arguments not a number', __filename);
  }
  return a + b;
}

module.exports = sum;
