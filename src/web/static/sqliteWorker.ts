/**
 * See: https://sqlite.org/wasm/doc/trunk/demo-123.md
 * And: https://www.npmjs.com/package/@sqlite.org/sqlite-wasm
 */
import sqlite3InitModule, {
  type Database,
} from "../../../node_modules/@sqlite.org/sqlite-wasm/dist/index.mjs";
import { getMotGtfsZipFile, readZip64File, ReadZippedfile } from "./zip.js";

// @ts-expect-error -- idk why it errors
import { datasetFileNames } from "../../../packages/gtfs/build/consts/datasetFileNames.mjs";

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

function populateDbFromGtfsData(db: Database, zipFiles: ReadZippedfile[]) {
  for (const zipFile of zipFiles) {
    const fileName = zipFile.headers.fileName;
    const tableName = fileName.split(".")[0];
    console.log("fileName", fileName);
    if (datasetFileNames[tableName]) {
      let firstLine: string;
      if (Array.isArray(zipFile.stringified))
        firstLine = zipFile.stringified[0].slice(
          0,
          zipFile.stringified[0].indexOf("\n"),
        );
      else
        firstLine = zipFile.stringified.slice(
          0,
          zipFile.stringified.indexOf("\n"),
        );

      const cleanFirstLine = firstLine.replaceAll("\r", "");
      if (!Array.isArray(zipFile.stringified)) {
        const sqlInsertionValues = zipFile.stringified
          .slice(zipFile.stringified.indexOf("\n")) // Remove the first line
          .replaceAll("\r", "") // Remove Windows specific \r\n, keep only \n
          .replace("\n", "(")
          .replaceAll("\n", "),(")
          .slice(0, -2); // Remove the last 2 characters left by the big .replaceAll()

        const sql = `
					INSERT INTO ${tableName} 
					(${cleanFirstLine})
					VALUES ${sqlInsertionValues};
					`;
        console.log("sql", sql);
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
