const jwt = require("jsonwebtoken");
const logger = require("../../logger");

// var token = jwt.sign({ foo: 'bar' }, process.env.SECRET);

async function signJWT(data) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, data },
      process.env.SECRET,
      function (err, token) {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(token);
      }
    );
  });
}

async function verifyJWT(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
      if (err) {
        console.log(err, err.message);
        logger.error(err);
        reject(err);
      }
      resolve(decoded);
    });
  });
}
module.exports = { signJWT, verifyJWT };
