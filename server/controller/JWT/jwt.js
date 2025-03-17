const jwt = require("jsonwebtoken");

// ✅ Load secret key safely
const SECRET_KEY = process.env.SECRET;
if (!SECRET_KEY) {
  console.error("❌ SECRET_KEY is missing in .env file!");
  process.exit(1); // Stop the server if secret key is missing
}

// ✅ Generate JWT Token
async function signJWT(user) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24-hour expiration
        data: {
          _id: user._id,
          role: user.role, // ✅ Ensure role is included
          first_name: user.first_name,
          email: user.email,
        },
      },
      SECRET_KEY,
      (err, token) => {
        if (err) {
          console.error("❌ Error Generating Token:", err);
          reject(err);
        }
        resolve(token);
      }
    );
  });
}

// ✅ Verify JWT Token
async function verifyJWT(token) {
  return new Promise((resolve, reject) => {
    if (!token) {
      console.error("🚨 Missing JWT Token!");
      return reject(new Error("Token is required"));
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("❌ JWT Verification Failed:", err.message);
        return reject(new Error("Invalid Token"));
      }

      if (!decoded || !decoded.data) {
        console.error("🚨 JWT Data Missing");
        return reject(new Error("Token data is missing"));
      }

      resolve(decoded);
    });
  });
}

module.exports = { signJWT, verifyJWT };
