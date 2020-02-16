const Product = require('./../models/Product');

module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  const { query: {query} } = ctx.request;

  const results = await Product
    .find({$text: { $search: query }}, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

  ctx.body = {products: results};
};
