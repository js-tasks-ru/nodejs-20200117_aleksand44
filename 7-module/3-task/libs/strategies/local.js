const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    async function(email, password, done) {
      const user = await User.findOne({email});

      if (!user) {
        return done(null, false, 'Нет такого пользователя');
      }

      const isPasswordCorrect = await user.checkPassword(password);

      if (!isPasswordCorrect) {
        return done(null, false, 'Неверный пароль');
      }

      return done(null, {
        email: user.email,
        displayName: user.displayName,
        id: user._id,
      });
    }
);
