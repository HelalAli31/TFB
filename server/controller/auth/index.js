const usersModel = require("../../models/usersSchema");
const logger = require("../../logger");
const mongoose = require("mongoose");

async function isUserRegistered(username, password) {
  try {
    const result = await usersModel.find(
      { username: username, password: password },
      { __v: false }
    );
    return result;
  } catch (error) {
    logger.error("error");
  }
}

async function createUser(userValues) {
  try {
    const result = await usersModel.insertMany([userValues]);
    return result;
  } catch (error) {
    logger.error("error");
  }
}
async function updateUser(userId, updateData) {
  try {
    // Use Mongoose's findOneAndUpdate to update the user
    const updatedUser = await usersModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(userId) }, // Find by _id
      { $set: updateData }, // Update fields
      { new: true, useFindAndModify: false } // Return the updated document
    );

    return updatedUser;
  } catch (error) {
    logger.error("Error in updateUser:", error);
    throw error;
  }
}
module.exports = { isUserRegistered, createUser, updateUser };
