const Message = require('../models/Message');

module.exports.messageList = async function messages(ctx, next) {
  if (!ctx.user) {
    ctx.status = 401;
    ctx.body = {
      error: 'Пользователь не залогинен',
    };
    return;
  }
  const {displayName: user} = ctx.user;

  const messages = await Message.find({user}).sort('-date').limit(20);

  const formattedMessages = messages.map(message => ({
    id: message._id,
    user: message.user,
    date: message.date,
    text: message.text,
  }));
  ctx.body = {messages: formattedMessages};

  return next();
};
