const userModel = require("../../models/usersSchema");

async function insertUsersToDB() {
  try {
    const resultFind = await userModel.find();
    console.log(resultFind);
    if (resultFind.length) return;
    const result = await userModel.insertMany(getUsersData());
    console.log(result);
  } catch (ex) {
    console.log(ex);
  } finally {
    process.exit(0);
  }
}

function getUsersData() {
  return [
    {
      first_name: "helal",
      last_name: "ali",
      email: "helal@hotmail.com",
      phone: "0543597871",
      address: "ibillin",
      username: "1",
      password: "1",
      role: "admin",
    },
    {
      first_name: "helal",
      last_name: "ali",
      email: "helal@hotmail.com",
      phone: "0543597871",
      address: "ibillin",
      username: "2",
      password: "2",
      role: "user",
    },
    {
      first_name: "besho",
      last_name: "ali",
      email: "helal@hotmail.com",
      phone: "0543597871",
      address: "ibillin",
      username: "2",
      password: "2",
      role: "user",
    },
  ];
}

module.exports = { insertUsersToDB };
