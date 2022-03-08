const { createLogger, format, transports, config } = require("winston");
const { combine, timestamp, json } = format;

const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: "cdas-server.log" }),
  ],
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    json()
  ),
});

module.exports = logger;
