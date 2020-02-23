const uuid = require('uuid/v4');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {
  const token = uuid();
  const {email, displayName, password} = ctx.request.body;

  try {
    const user = new User({
      email,
      displayName,
      verificationToken: token,
    });
    await user.setPassword(password);
    await user.save();
  }
  catch (errs) {
    ctx.status = 400;

    const { errors } = errs;

    const response = {
      errors: {},
    };

    for (const key in errors) {
      if ({}.hasOwnProperty.call(errors, key)) {
        response.errors[key] = errors[key].message;
      }
    }

    ctx.body = response;
    return;
  }

  await sendMail({
    template: 'confirmation',
    locals: {token: `http://localhost:3000/confirm/${token}`},
    to: email,
    subject: 'Подтвердите почту',
  });
  ctx.status = 200;
  ctx.body = {status: 'ok'};
  return next();
};

module.exports.confirm = async (ctx, next) => {
  const { verificationToken } = ctx.request.body;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    ctx.status = 400;
    ctx.body = {error: 'Ссылка подтверждения недействительна или устарела'};
    return;
  }

  user.verificationToken = undefined;
  user.save();

  ctx.body = {
    token: verificationToken,
  };

  return next();
};
