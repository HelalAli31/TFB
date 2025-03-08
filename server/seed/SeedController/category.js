const CategoryModel = require("../../models/categorySchema");

async function insertCategoryToDB() {
  try {
    const resultFind = await CategoryModel.find();
    if (resultFind.length) return;
    const result = await CategoryModel.insertMany(getCategorysData());
    console.log(result);
  } catch (ex) {
    console.log(ex);
  } finally {
    process.exit(0);
  }
}

function getCategorysData() {
  return [
    {
      name: "MTL",
    },
    {
      name: "DL",
    },
    {
      name: "Mod",
    },
    {
      name: "Tanks",
    },
    {
      name: "Canabis",
    },
    {
      name: "Disposables",
    },
    {
      name: "Pods",
    },
    {
      name: "Coils",
    },
    {
      name: "Accessories",
    },
    {
      name: "Normal",
    },
    {
      name: "Salt",
    },
    {
      name: "Vg",
    },
  ];
}

module.exports = { insertCategoryToDB };
