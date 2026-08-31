/**
 * See: https://sqlite.org/wasm/doc/trunk/demo-123.md
 * And: https://www.npmjs.com/package/@sqlite.org/sqlite-wasm
 */
import sqlite3InitModule from "../../../node_modules/@sqlite.org/sqlite-wasm/dist/index.mjs";
import { getMotGtfsZipFile } from "./zip.js";

async function initializeSqliteAndDb() {
  try {
    const sqlite3 = await sqlite3InitModule();
    console.info("Running SQLite3 version", sqlite3.version.libVersion);
    const db =
      "opfs" in sqlite3
        ? new sqlite3.oo1.OpfsDb("/mydb.sqlite3")
        : new sqlite3.oo1.DB("/mydb.sqlite3", "ct");
    console.info(
      "opfs" in sqlite3
        ? `OPFS is available, created persisted database at ${db.filename}`
        : `OPFS is not available, created transient database ${db.filename}`,
    );
    return db;
  } catch (err) {
    if (err instanceof Error) {
      console.error("Initialization error:", err.name, err.message);
    }
  }
}

async function main() {
  const db = await initializeSqliteAndDb();
  if (!db) return;
  const hi = db.selectObjects("SELECT * FROM sqlite_schema WHERE type='table'");
  // await getMotGtfsZipFile();
  postMessage(hi);
}

main();
