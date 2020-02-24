const Order = require('../models/Order');
const Session = require('../models/Session');
const User = require('../models/User');
const Product = require('../models/Product');
const sendMail = require('../libs/sendMail');

async function findUserBySession(ctx) {
  const {authorization} = ctx.header;

  const [, token] = authorization.split(' ');

  const session = await Session.findOne({token});

  if (!session) {
    return null;
  }

  return session.user;
}

async function sendMailToUserAboutSuccessfulOrder(userId, order) {
  const user = await User.findById(userId);
  const product = await Product.findById(order.product);

  await sendMail({
    template: 'order-confirmation',
    locals: {
      id: order.id,
      product,
    },
    to: user.email,
    subject: 'Подтвердите почту',
  });
}

module.exports.checkout = async function checkout(ctx, next) {
  const {user: userFromBody, product, phone, address} = ctx.request.body;

  const userFromSession = await findUserBySession(ctx);

  let order;
  try {
    order = await Order.create({user: userFromSession || userFromBody, product, phone, address});
  }
  catch (e) {
    ctx.status = 400;
    const { errors } = e;

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
  const {id, user} = order;

  await sendMailToUserAboutSuccessfulOrder(user, order);

  ctx.status = 200;
  ctx.body = {
    order: id,
  };

  return next();
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  const user = await findUserBySession(ctx);

  const orders = await Order.find({user}).populate('product');

  const formattedOrders = orders.map(order => {
    const {product} = order;

    return {
      id: order._id,
      user: order.user,
      phone: order.phone,
      address: order.address,
      product: {
        images: product.images,
        id: product._id,
        title: product.title,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        price: product.price,
      },
    };
  });

  ctx.status = 200;
  ctx.body = {
    orders: formattedOrders,
  };

};
