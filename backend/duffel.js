const { Duffel } = require("@duffel/api");

const duffel = new Duffel({
  token: process.env.DUFFEL_API_KEY,
});

module.exports = duffel;
