const User = require('../../models/User');

function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = (message || '');
  this.errors = {
    email: {
      message: 'Некорректный email.',
    },
  };
}
ValidationError.prototype = Error.prototype;

module.exports = async function authenticate(strategy, email, displayName, done) {
  if (!email) {
    return done(null, false, 'Не указан email');
  }

  if (!~email.indexOf('@')) {
    const err = new ValidationError({
      email,
    });
    console.log(err.name);
    return done(err);
  }

  const user = await User.findOne({ email });

  if (!user) {
    const newUser = await User.create({ email, displayName });

    return done(null, newUser);
  }

  return done(null, user);
};
