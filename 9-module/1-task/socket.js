const socketIO = require('socket.io');

const Session = require('./models/Session');
const Message = require('./models/Message');

function socket(server) {
  const io = socketIO(server);

  io.use(async function(socket, next) {
    const {token} = socket.handshake.query;

    if (!token) {
      return next(new Error('anonymous sessions are not allowed'));
    }
    const session = await Session.findOne({token}).populate('user');

    if (!session) {
      return next(new Error('wrong or expired session token'));
    }

    const {user: {email, displayName, _id: id}} = session;

    socket.user = {
      email,
      displayName,
      id,
    };
    return next();
  });

  io.on('connection', function(socket) {
    socket.on('message', async (msg) => {
      await Message.create({
        user: socket.user.displayName,
        chat: socket.user.id,
        date: new Date(),
        text: msg,
      });
    });
  });

  return io;
}

module.exports = socket;
