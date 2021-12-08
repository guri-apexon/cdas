const { Pool, Client } = require("pg");

const pool = new Pool({
  user: confg.DB_USER,
  host: confg.DB_HOST,
  database: confg.DB_DATABASE,
  password: confg.DB_PASS,
  port: confg.DB_PORT,
  connectionLimit: 100,
  queueLimit: 0,
  waitForConnections: true,
  acquireTimeoutMillis: 60000,
  idleTimeoutMillis: 600000, // 10 minutes
  connectionTimeoutMillis: 20000,
});

pool.connect((err) => {
  if (err) {
    console.log("error connecting to db", err.stack);
    process.exit(1);
  }
  console.log("Connected to db...");
});
