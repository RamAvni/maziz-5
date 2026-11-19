// @ts-ignore -- idk why it errors

import { gtfsFunctionImplementation } from "../../../packages/open-bus-api/build/index.mjs";
import { LeafletMap, TileLayer, Marker, Icon as LeafletIcon } from '../../../node_modules/leaflet/src/Leaflet.js';

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

function initializeLeaflet() {
  const map = new LeafletMap('map').setView([31.430795, 34.586064], 13);

  new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> - Maziz!',
      crossOrigin: 'anonymous'
  }).addTo(map);

  return map;
}

async function main() {
  initializeSqlite();

  const stationInRadius = await gtfsFunctionImplementation.getStationsByCordBounds(
      31.46747147083975, 34.660148620605476
      31.394234718031928, 34.51200485229493
  );
  console.log("stationsInRadius: ", stationInRadius);

  const map = initializeLeaflet();

  const busLeafletIcon = new LeafletIcon({iconUrl: "../media/directions-bus.png"})
  stationInRadius.forEach((station) => new Marker([station.stopLat, station.stopLon], { title: station.stopName, icon: busLeafletIcon  }).addTo(map))
}

await main();
