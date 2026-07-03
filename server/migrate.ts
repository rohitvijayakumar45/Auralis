import { pool } from "./src/db/pool.js";

async function run() {
  try {
    await pool.execute("ALTER TABLE photos ADD COLUMN file_size BIGINT DEFAULT 0");
    console.log("Successfully added file_size column");
  } catch (err: any) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column file_size already exists");
    } else {
      console.error(err);
    }
  }
  process.exit(0);
}
run();
