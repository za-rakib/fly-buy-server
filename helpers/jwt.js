var expressJwt = require("express-jwt");

function authJtw() {
  const api = process.env.API_URL;
  return expressJwt({
    secret: process.env.secret,
    algorithms: ["HS256"],
  }).unless({
    path: [
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}
module.exports = authJtw;
