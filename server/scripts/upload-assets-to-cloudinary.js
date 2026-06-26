require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { uploadBuffer } = require("../config/cloudinary");

const assetsRoot = path.join(__dirname, "..", "assets");
const folders = ["products", "categories", "sliders"];

async function uploadFolder(folder) {
  const folderPath = path.join(assetsRoot, folder);
  if (!fs.existsSync(folderPath)) {
    return;
  }

  const files = fs
    .readdirSync(folderPath)
    .filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file));

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const buffer = fs.readFileSync(filePath);

    await uploadBuffer({ buffer }, folder, file);
    console.log(`Uploaded ${folder}/${file}`);
  }
}

async function main() {
  for (const folder of folders) {
    await uploadFolder(folder);
  }
}

main().catch((error) => {
  console.error("Failed to upload assets to Cloudinary:", error);
  process.exit(1);
});
