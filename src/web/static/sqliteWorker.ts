/**
 * See: https://sqlite.org/wasm/doc/trunk/demo-123.md
 * And: https://www.npmjs.com/package/@sqlite.org/sqlite-wasm
 */
import sqlite3InitModule, {
  Sqlite3Static,
  type Database,
} from "../../../node_modules/@sqlite.org/sqlite-wasm/dist/index.mjs";
import { getMotGtfsZipFile, readZip64File, ReadZippedfile } from "./zip.js";

// @ts-ignore -- idk why it errors
import { datasetFileNames } from "../../../packages/gtfs/build/consts/datasetFileNames.mjs";
// @ts-ignore -- idk why it errors
import {
  fileNamesToTableNames,
  sqlCreateTableCommands,
  TableName,
} from "../../../packages/gtfs/build/consts/sqlCommands.mjs";

async function initializeSqliteAndDb() {
  try {
    const sqlite3 = await sqlite3InitModule();
    console.info("Running SQLite3 version", sqlite3.version.libVersion);
    const db =
      "opfs" in sqlite3
        ? new sqlite3.oo1.OpfsDb("/mydb.sqlite3")
        : new sqlite3.oo1.DB("/mydb.sqlite3", "c");
    console.info(
      "opfs" in sqlite3
        ? `OPFS is available, created persisted database at ${db.filename}`
        : `OPFS is not available, created transient database ${db.filename}`,
    );
    globalThis.sqlite3 = sqlite3;
    globalThis.db = db;

    // TODO: add a check in case of corrupted database, i.e. phone shuts down mid proccess
    db.exec(`
  PRAGMA synchronous = OFF;
  PRAGMA journal_mode = MEMORY;
  PRAGMA temp_store = MEMORY;
`);
    return db;
  } catch (err) {
    if (err instanceof Error) {
      console.error("Initialization error:", err.name, err.message);
    }
  }
}

function getBigSqlInsertionString(
  tableName: string,
  firstLine: string,
  valuesOnce: string,
  amount: number,
) {
  const placeholders = valuesOnce.repeat(amount).slice(0, -1); // Remove the last comma
  return `INSERT INTO ${tableName} (${firstLine}) VALUES ${placeholders}`;
}

async function populateDbFromGtfsData(
  db: Database,
  zipFiles: ReadZippedfile[],
  batchSize?,
) {
  if (!batchSize)
    batchSize =
      (globalThis.sqlite3 as Sqlite3Static).capi.sqlite3_limit(
        db.pointer ?? 0,
        (globalThis.sqlite3 as Sqlite3Static).capi.SQLITE_LIMIT_VARIABLE_NUMBER,
        -1,
      ) - 1;
  for (const zipFile of zipFiles) {
    const fileName = zipFile.headers.fileName;
    const tableName = fileNamesToTableNames[fileName] as TableName | undefined;
    if (!tableName) throw new Error("couldn't find tableName!");
    console.time(tableName);

    console.debug(sqlCreateTableCommands[tableName]);
    db.exec(sqlCreateTableCommands[tableName]);

    // let pocket;
    // let offset = 0;
    for await (const chunk of zipFile.fileBytes) {
      let fileStart = 0;
      if (chunk[0] === 239 && chunk[1] === 187 && chunk[2] === 191)
        fileStart = 3; // skip UTF-8 BOM magic number

      const decoder = new TextDecoder();
      const values: (string | number | null)[][] = [];
      let tempValues: (string | number | null)[] = [];
      let currentValueStart: number = fileStart;
      for (let i = fileStart; i < chunk.length; i++) {
        // 10 is utf-8 for the "\n" character
        if (chunk[i] === 10) {
          values.push(tempValues);
          tempValues = [];
          currentValueStart = i + 1;
        }
        // 44 is utf-8 for the "," character
        else if (chunk[i] === 44) {
          const currentValue = decoder.decode(
            chunk.slice(currentValueStart, i),
          );
          const numberedCurrentValue = Number(currentValue);
          if (numberedCurrentValue || numberedCurrentValue === 0)
            tempValues.push(numberedCurrentValue);
          else if (currentValue === "") tempValues.push(null);
          else tempValues.push(currentValue);

          currentValueStart = i + 1;
        }
      }
    }

    // db.exec("BEGIN");
    //
    // db.exec("COMMIT");
    console.timeEnd(tableName);
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
  const readZipFiles = readZip64File(zipFile);

  populateDbFromGtfsData(db, readZipFiles);

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
