const express = require("express");
const {
  isUserRegistered,
  createUser,
  updateUser,
} = require("../controller/auth");
const getValidationFunction = require("../validations/userValidation");
const router = express.Router();
const { signJWT, verifyJWT } = require("../controller/JWT/jwt");
const logger = require("../logger/index");

const allowUserOrAdmin = async (req, res, next) => {
  try {
    const clientJwt = req.headers.authorization; // Get the token directly
    console.log("Authorization Header:", clientJwt); // Log the received token

    if (!clientJwt) {
      throw new Error("Missing Authorization token");
    }

    const verify = await verifyJWT(clientJwt); // Verify the token
    const role = verify?.data?.[0]?.role;
    // if logged in
    if (role) {
      req.user = verify.data[0]; // Attach user data to the request
      return next(); // Proceed to the next middleware or route
    }

    throw new Error("Unauthorized role");
  } catch (error) {
    logger.error("Authorization error:", error);
    return res
      .status(403)
      .json({ message: "Access Denied", error: error.message });
  }
};

router.post(
  "/login",
  getValidationFunction("login"),
  async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) res.send("error");
    logger.info(`${username} is trying to loggin`);

    const result = await isUserRegistered(username, password);
    if (result?.length) {
      {
        const userToken = await signJWT(result);
        return res.json({
          userToken,
        });
      }
    } else {
      logger.error(`login failed by user:${username} and password:${password}`);
      return res.json(`Login Failed`);
    }
  }
);

router.post(
  `/register`,
  getValidationFunction("register"),
  async (req, res, next) => {
    const { email } = req.body;
    if (!email) throw new Error("general error");
    try {
      const result = await isUserRegistered(email);
      if (result[0]) {
        console.log("found");
        throw new Error(`User ${email} is already exist`);
      }
      const create = await createUser(req.body);
      console.log(create);
      if (create) {
        logger.info(`${req.body.email} has just joined us `);
        return res.json(`Registration completed`);
      } else throw new Error("Registration Failed");
    } catch (ex) {
      logger.error("userName is already exists");
      return res.json({
        message: "this userName is already exists!",
        data: email,
      });
    }
  }
);
router.post(
  "/updateUser",
  allowUserOrAdmin, // Middleware to allow both users and admins
  getValidationFunction("updateUser"), // Correct validation middleware
  async (req, res, next) => {
    const { userId, updateData } = req.body;

    if (!userId || !updateData) {
      return res
        .status(400)
        .json({ message: "User ID and update data are required" });
    }

    try {
      const updatedUser = await updateUser(userId, updateData);
      if (!updatedUser) {
        return res
          .status(404)
          .json({ message: "User not found or update failed" });
      }
      logger.info(`User with ID ${userId} has been updated`);
      return res
        .status(200)
        .json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      logger.error("Error updating user:", error);
      return res
        .status(500)
        .json({ message: "Failed to update user", error: error.message });
    }
  }
);

module.exports = router;
