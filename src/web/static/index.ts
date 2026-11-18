// @ts-ignore -- idk why it errors

import { gtfsFunctionImplementation } from "../../../packages/open-bus-api/build/index.mjs";

function initializeSqlite() {
  const worker = new Worker("./sqliteWorker.js", { type: "module" });
  worker.onmessage = function (e) {
    console.log("data from worker:", e.data);
  };

  const offlineBtn = document.getElementById(
    "offline-btn",
  ) as HTMLButtonElement | null;

  offlineBtn?.addEventListener("click", () => {
    worker.postMessage("offline-fetch");
    offlineBtn.disabled = true;
  });
}

async function main() {
  initializeSqlite();
  const stationInRadius = await gtfsFunctionImplementation.getStationsByRadius(
    31.430795,
    34.586064,
    10,
  );
  console.log("stationsInRadius: ", stationInRadius);
}

await main();
