const mongoose = require("mongoose");

const {
  MONGODB_HOST,
  MONGODB_DATABASE_NAME,
  MONGODB_PORT,
  MONGODB_USER,
  MONGODB_PASSWORD,
} = process.env;

async function createConnection() {
  console.log("Creating mongoDB connection");
  const credentials =
    MONGODB_USER && MONGODB_PASSWORD
      ? `${MONGODB_USER}:${MONGODB_PASSWORD}@`
      : "";
  try {
    await mongoose.connect(
      `mongodb://${credentials}${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE_NAME}`,
      { useUnifiedTopology: true, useNewUrlParser: true }
    );

    console.log(`Server is connected to: ${MONGODB_HOST}`);
  } catch (ex) {
    console.log(ex);
    process.exit(1);
  }
}

module.exports = createConnection;
