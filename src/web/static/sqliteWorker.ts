/**
 * See: https://sqlite.org/wasm/doc/trunk/demo-123.md
 * And: https://www.npmjs.com/package/@sqlite.org/sqlite-wasm
 */
import sqlite3InitModule, {
  type Database,
} from "../../../node_modules/@sqlite.org/sqlite-wasm/dist/index.mjs";
import {
  getMotGtfsZipFile,
  normalizeCsvTextFile,
  readZip64File,
  ReadZippedfile,
} from "./zip.js";

// @ts-ignore -- idk why it errors
import { datasetFileNames } from "../../../packages/gtfs/build/consts/datasetFileNames.mjs";
// @ts-ignore -- idk why it errors
import { sqlCreateTableCommands } from "../../../packages/gtfs/build/consts/sqlCommands.mjs";

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
    globalThis.db = db;
    return db;
  } catch (err) {
    if (err instanceof Error) {
      console.error("Initialization error:", err.name, err.message);
    }
  }
}

function populateDbFromGtfsData(db: Database, zipFiles: ReadZippedfile[]) {
  // NOTE: agency_url should be NOT NULL, but mot is.. mot.

  for (const zipFile of zipFiles) {
    const fileName = zipFile.headers.fileName;
    const tableName = fileName.split(".")[0];

    console.debug(tableName, sqlCreateTableCommands[tableName]);
    db.exec(sqlCreateTableCommands[tableName]);

    if (datasetFileNames[tableName]) {
      console.log("if (datasetFileNames[tableName]) {");
      let firstLine: string;
      if (Array.isArray(zipFile.stringified))
        firstLine = zipFile.stringified[0]
          .slice(0, zipFile.stringified[0].indexOf("\n"))
          .replaceAll("\r", "");
      else
        firstLine = zipFile.stringified
          .slice(0, zipFile.stringified.indexOf("\n"))
          .replaceAll("\r", "");

      if (!Array.isArray(zipFile.stringified)) {
        console.log("if (!Array.isArray(zipFile.stringified)) {");
        const sqlInsertionValues = zipFile.stringified
          .slice(zipFile.stringified.indexOf("\r\n")) // Remove the first line
          .replace("\r\n", "(")
          .replaceAll("\r\n", "),\n(")
          .replaceAll(
            /(?<=[(,])(\d*[^()\d,\n]+\d*[^()\d,\n]*)+(?=[,)])/g, // THIS CAPTURES 8.00
            (match) => `'${match}'`,
          )
          .replaceAll(/(,(?=,))|(,(?=\)))/g, () => `,null`)

          .slice(0, -4); // Remove the last 2 characters left by the big .replaceAll()

        const sql = `
      INSERT INTO ${tableName}
      (${firstLine})
      VALUES ${sqlInsertionValues});
      `;
        console.debug(sql);
        db.exec(sql);
      }
    }
  }
}

async function main() {
  const db = await initializeSqliteAndDb();
  if (!db) {
    console.warn("No database!");
    return;
  }
  const hi = db.selectObjects("SELECT * FROM sqlite_schema WHERE type='table'");
  const zipFile = await getMotGtfsZipFile();
  if (!zipFile) {
    console.warn("Failed to get the zip file!");
    return;
  }
  const stringifiedFiles = await readZip64File(
    zipFile,
    function (headers, zipAsString) {
      // console.log(headers, zipAsString);
    },
  );

  populateDbFromGtfsData(db, stringifiedFiles);

  // const files = stringifiedFiles.reduce(
  //   (prevObj, currentFile) => ({
  //     ...prevObj,
  //     [currentFile.headers.fileName]: normalizeCsvTextFile(
  //       currentFile.stringified,
  //     ),
  //   }),
  //   {},
  // );
  // console.log(files);

  // postMessage(hi);
}

await main();
