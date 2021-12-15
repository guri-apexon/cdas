const compression = require("compression");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");


const app = express();
dotenv.config();
const PORT = process.env.PORT;
let dir = "./public/exports";
const apiRoutes = require("./route/routes");

// const Logger = require("./config/logger");

const shouldCompress = (req, res) => {
  if (req.headers["x-no-compression"]) {
    // Will not compress responses, if this header is present
    return false;
  }
  // Resort to standard compression
  return compression.filter(req, res);
};
app.use(
  compression({
    filter: shouldCompress,
    threshold: 0,
  })
);
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: "cdascore",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.json({ limit: "50mb" }));

//Route Prefixes
app.use("/", apiRoutes);

app.use(
  express.urlencoded({
    extended: true,
    parameterLimit: 500000000,
  })
);

app.use("/public", express.static("public"));

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
app.listen(PORT, () => {
  console.log(`app started on port ${PORT}`);
  // Logger.info({ message: `app started on port ${PORT}` });
});
