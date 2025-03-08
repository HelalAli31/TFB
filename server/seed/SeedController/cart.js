const CartModel = require("../../models/cartSchema");
const UserModel = require("../../models/usersSchema");

async function insertCartToDB() {
  try {
    const resultFind = await CartModel.find();
    const resultUser = await UserModel.find();
    if (resultFind.length) return;
    const result = await CartModel.insertMany(getCartsData(resultUser[1]?._id));
    console.log(result);
  } catch (ex) {
    console.log(ex);
  } finally {
    process.exit(0);
  }
}

function getCartsData(userId) {
  return [
    {
      user_id: userId,
    },
  ];
}

module.exports = { insertCartToDB };
