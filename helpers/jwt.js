var expressJwt = require("express-jwt");

function authJtw() {
  return expressJwt({
    secret: process.env.secret,
    algorithms: ["HS256"],
  }).unless({
    path: ["/token"],
  });
}
module.exports = authJtw;
