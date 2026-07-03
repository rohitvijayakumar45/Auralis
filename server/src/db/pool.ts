import mysql from "mysql2/promise";
import { getConfig } from "../config.js";

const config = getConfig();

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: "Z"
});
