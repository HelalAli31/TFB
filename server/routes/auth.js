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
console.log("LOGIN");
const bcrypt = require("bcryptjs");
const usersModel = require("../models/usersSchema");

const allowUserOrAdmin = async (req, res, next) => {
  try {
    if (!req.headers || !req.headers.authorization) {
      console.error("🚨 Missing Authorization Header!");
      return res.status(403).json({ message: "Unauthorized: Missing Token" });
    }

    let authHeader = req.headers.authorization;

    if (!authHeader.startsWith("Bearer ")) {
      console.error("🚨 Invalid Token Format:", authHeader);
      return res
        .status(403)
        .json({ message: "Unauthorized: Invalid Token Format" });
    }

    let token = authHeader.split(" ")[1].trim(); // ✅ Extract token correctly

    if (!token) {
      console.error("🚨 Empty Token Received");
      return res.status(403).json({ message: "Unauthorized: Empty Token" });
    }

    const verify = await verifyJWT(token); // ✅ Verify token

    if (!verify || !verify.data || !verify.data._id) {
      console.error("🚨 Invalid Token Data", verify);
      return res
        .status(403)
        .json({ message: "Unauthorized: Invalid Token Data" });
    }

    req.user = verify.data; // ✅ Attach user to request
    next();
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.message);
    return res
      .status(403)
      .json({ message: "Unauthorized: Invalid Token", error: error.message });
  }
};

router.get("/profile", allowUserOrAdmin, async (req, res) => {
  try {
    console.log("🔍 Requesting user profile for:", req.user); // Debugging line

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "❌ Unauthorized: Invalid token." });
    }

    const user = await usersModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "❌ User not found." });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    return res.status(500).json({ message: "❌ Internal server error." });
  }
});

router.post("/changePassword", allowUserOrAdmin, async (req, res) => {
  try {
    const { userId, old_password, new_password } = req.body;
    console.log("🛠️ Received password change request:", req.body);

    if (!userId || !old_password || !new_password) {
      return res.status(400).json({ message: "❌ All fields are required." });
    }

    // ✅ Find the user in the database
    const user = await usersModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "❌ User not found." });
    }

    // ✅ Compare plain text passwords
    if (user.password !== old_password) {
      console.log(`🚨 Incorrect old password for user: ${userId}`);
      return res.status(400).json({ message: "❌ Incorrect old password." });
    }

    // ✅ Update password in database
    user.password = new_password;
    await user.save();

    console.log(`✅ Password updated successfully for user: ${userId}`);
    return res.json({ message: "✅ Password updated successfully!" });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    return res.status(500).json({ message: "❌ Internal server error." });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "❌ Username and password are required." });
  }

  try {
    const user = await isUserRegistered(username, password);

    if (!user) {
      return res
        .status(401)
        .json({ message: "❌ Invalid username or password." });
    }

    // Remove password before sending the response
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Generate token
    const userToken = await signJWT(userWithoutPassword);

    return res.json({ userToken, user: userWithoutPassword });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ message: "❌ Internal server error." });
  }
});

// ✅ Register Route
router.post("/register", async (req, res) => {
  const { first_name, last_name, username, email, phone, address, password } =
    req.body;

  if (
    !first_name ||
    !last_name ||
    !username ||
    !email ||
    !phone ||
    !address ||
    !password
  ) {
    return res.status(400).json({ message: "❌ All fields are required." });
  }

  try {
    // ✅ Ensure isUserRegistered always returns an array
    const existingUser = await isUserRegistered(email);

    if (existingUser.length > 0) {
      // ✅ This will not crash anymore
      return res
        .status(400)
        .json({ message: `❌ User ${email} already exists.` });
    }

    // ✅ Create new user with hashed password
    const newUser = await createUser({
      first_name,
      last_name,
      username,
      email,
      phone,
      address,
      password,
    });

    if (newUser) {
      return res
        .status(201)
        .json({ message: "✅ Registration successful!", user: newUser });
    } else {
      throw new Error("❌ Registration failed.");
    }
  } catch (error) {
    logger.error("❌ Registration error:", error);
    return res.status(500).json({ message: "❌ Internal server error." });
  }
});

// ✅ Update User Route
router.post("/updateUser", allowUserOrAdmin, async (req, res) => {
  try {
    const { userId, updateData } = req.body;

    if (!userId || !updateData) {
      return res
        .status(400)
        .json({ message: "❌ User ID and update data are required" });
    }

    // ✅ Allow only the logged-in user to update their own data
    if (String(req.user._id) !== String(userId)) {
      return res.status(403).json({
        message: "❌ Unauthorized: You can only update your own profile!",
      });
    }

    const updatedUser = await updateUser(userId, updateData);
    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "❌ User not found or update failed" });
    }

    logger.info(`✅ User with ID ${userId} has been updated`);
    return res
      .status(200)
      .json({ message: "✅ User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return res
      .status(500)
      .json({ message: "❌ Internal server error.", error: error.message });
  }
});

module.exports = router;
