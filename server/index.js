require("dotenv").config();
const express = require("express");
const cors = require("cors");
const createConnection = require("./connection/index");
const bodyParser = require("body-parser");
const productsRoute = require("./routes/product");
const categoryRoute = require("./routes/category");
const userRoute = require("./routes/auth");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes//orders");
const nodemailer = require("nodemailer");

//Routes
const app = express();
const allowedOrigins = [
  "http://localhost:4200",
  "https://thefogbank.online",
  "https://www.thefogbank.online",
  "https://tfb-bice.vercel.app",
];
app.get("/", (req, res) => {
  res.send("✅ TFB backend is alive and running on Render!");
});
//he
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // only if you’re using cookies
  })
);

const path = require("path");

app.use(cors());
app.use(express.static("public"));

app.use(bodyParser.json());

createConnection();
const cron = require("node-cron");

// Run check every 5 minutes (adjust as needed)
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Running daily sale expiration check...");
  await checkAndUpdateSales();
  console.log("✅ Daily sale check complete.");
});

app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(
      `[ROUTE] ${r.route.stack[0].method.toUpperCase()} ${r.route.path}`
    );
  }
});

// imageas to render
const persistentAssetsDir = "/mnt/data/assets";
const fs = require("fs-extra");
fs.ensureDirSync(persistentAssetsDir);
app.use("/assets", express.static(persistentAssetsDir));
const localAssetsDir = path.join(__dirname, "persistent-assets");

if (fs.existsSync(localAssetsDir)) {
  fs.copySync(localAssetsDir, persistentAssetsDir, { overwrite: false });
  console.log("✅ Copied initial assets to persistent storage.");
}

app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;
  console.log("GMAIL_USER:", process.env.GMAIL_USER);
  console.log(
    "GMAIL_PASSWORD:",
    process.env.GMAIL_PASSWORD ? "✅ Password Loaded" : "❌ MISSING"
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: email,
    to: "helalali358@gmail.com",
    subject: `New Contact Message from ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ success: false, error });
  }
});
app.use("/auth", userRoute);
app.use("/products", productsRoute);
app.use("/cart", cartRoute);
console.log("HEL");
app.use("/category", categoryRoute);
app.use("/orders", orderRoute);

app.use((error, req, res, next) => {
  console.log("in error handler...");
  res.send("Something went wrong");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
