const compression = require("compression");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
var apiRouter = require("./route/api");


const app = express();
dotenv.config();
const PORT = process.env.PORT;
let dir = "./public/exports";
const auth = require("./controller/auth");

const Logger = require("./config/logger");

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
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    extended: true,
    parameterLimit: 500000000,
  })
);

app.all("/sda", auth.authHandler);
app.use("/public", express.static("public"));

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
app.listen(PORT, () => {
  console.log(`app started on port ${PORT}`);
    // Logger.info({ message: `app started on port ${PORT}` });
});

//Route Prefixes
app.use("/api/", apiRouter);
