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
    // const db = new sqlite3.oo1.OpfsDb("/mydb.sqlite3");
    const pool = await sqlite3.installOpfsSAHPoolVfs({});
    const db = new pool.OpfsSAHPoolDb("/mydb.sqlite3");
    globalThis.sqlite3 = sqlite3;
    globalThis.db = db;

    // TODO: add a check in case of corrupted database, i.e. phone shuts down mid proccess
    db.exec(`
PRAGMA page_size = 8192;
PRAGMA cache_size = -65536;      
PRAGMA locking_mode = EXCLUSIVE; 
PRAGMA journal_mode = OFF;       
PRAGMA synchronous = OFF;
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
  amount: number,
) {
  const valuesOnce = firstLine
    .split(",")
    .map(() => "?,")
    .join("");
  const placeholders = valuesOnce.repeat(amount).slice(0, -1); // Remove the last comma
  return `INSERT INTO ${tableName} (${firstLine}) VALUES (${placeholders})`;
}

async function populateDbFromGtfsData(
  db: Database,
  zipFiles: ReadZippedfile[],
  batchSize?: number,
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

    let statment: ReturnType<typeof db.prepare> | null;
    let firstLine: string | null = null;
    let rowValues: (string | number | null)[] = []; // Putting this here is practically gambling. since when a second chunk comes from await chunk of zipFole.fileBytes, we can't know if it stopped exactly at the right spot, and whether we won't read garbage values.
    db.exec("BEGIN TRANSACTION");
    for await (const chunk of zipFile.fileBytes) {
      let start = 0;
      if (chunk[0] === 239 && chunk[1] === 187 && chunk[2] === 191) start = 3; // skip UTF-8 BOM magic number

      const decoder = new TextDecoder();
      let currentValueStart: number = start;
      for (let i = start; i < chunk.length; i++) {
        // 10 is utf-8 for the "\n" character
        if (chunk[i] === 10) {
          {
            // Add the last element, that doesn't have a "," at the end of the line. this is a copy of the code below.
            const currentValue = decoder.decode(
              chunk.subarray(currentValueStart, i),
            );
            const numberedCurrentValue = Number(currentValue);
            if (numberedCurrentValue || numberedCurrentValue === 0)
              rowValues.push(numberedCurrentValue);
            else if (currentValue === "") rowValues.push(null);
            else rowValues.push(currentValue);
          }
          if (!firstLine) {
            firstLine = rowValues.join(",");

            statment = db.prepare(
              getBigSqlInsertionString(tableName, firstLine, 1),
            );
          } else {
            statment!.bind(rowValues);
            statment!.step();
            statment!.reset();
          }

          rowValues = [];
          currentValueStart = i + 1;
        }
        // 44 is utf-8 for the "," character
        else if (chunk[i] === 44) {
          const currentValue = decoder.decode(
            chunk.slice(currentValueStart, i),
          );
          const numberedCurrentValue = Number(currentValue);
          if (numberedCurrentValue || numberedCurrentValue === 0)
            rowValues.push(numberedCurrentValue);
          else if (currentValue === "") rowValues.push(null);
          else rowValues.push(currentValue);

          currentValueStart = i + 1;
        }
      }
    }
    console.time("statment.finalize");
    statment!.finalize();
    console.timeEnd("statment.finalize");
    console.timeEnd(tableName);
    db.exec("COMMIT");
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
