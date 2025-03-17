const usersModel = require("../../models/usersSchema");
const logger = require("../../logger");
const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

async function isUserRegistered(username, password) {
  try {
    const user = await usersModel.findOne({ username, password }); // ✅ Plain text comparison

    return user || null; // Return `null` if no user found
  } catch (error) {
    logger.error("❌ Error in isUserRegistered:", error);
    throw error;
  }
}

async function createUser(userValues) {
  try {
    const { email, username } = userValues;

    // ✅ Check if the user already exists
    const existingUser = await usersModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      throw new Error("❌ User already exists with this email or username");
    }

    // 🚀 Store password directly without hashing
    const result = await usersModel.create(userValues);
    return result;
  } catch (error) {
    logger.error("❌ Error in createUser:", error);
    throw error;
  }
}

async function updateUser(userId, updateData) {
  try {
    // ✅ Check if new email or username is already taken
    if (updateData.email || updateData.username) {
      const existingUser = await usersModel.findOne({
        $or: [{ email: updateData.email }, { username: updateData.username }],
        _id: { $ne: userId }, // Exclude the current user from the check
      });

      if (existingUser) {
        throw new Error("❌ Email or Username is already taken.");
      }
    }

    const updatedUser = await usersModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(userId) },
      { $set: updateData },
      { new: true, useFindAndModify: false }
    );

    return updatedUser;
  } catch (error) {
    logger.error("❌ Error in updateUser:", error);
    throw error;
  }
}

module.exports = { isUserRegistered, createUser, updateUser };
