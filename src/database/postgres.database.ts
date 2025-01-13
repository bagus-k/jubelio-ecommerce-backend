import pgPromise from "pg-promise";
import { config } from "../config/db";

const db = pgPromise()({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.username,
  password: config.database.password,
  // max: config.database.max_open,
  // idleTimeoutMillis: config.database.max_idle,
  // connectionTimeoutMillis: config.database.timeout,
});

db.connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Connection failed:", error.message);
  });

export default db;
