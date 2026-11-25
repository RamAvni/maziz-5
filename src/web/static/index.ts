// @ts-ignore -- idk why it errors

import { gtfsFunctionImplementation } from "../../../packages/open-bus-api/build/index.mjs";
import {
  LeafletMap,
  TileLayer,
  Marker,
  Icon as LeafletIcon,
} from "../../../node_modules/leaflet/src/Leaflet.js";
// } from "leaflet";
import { Stop } from "gtfs";

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
  const map = new LeafletMap("map").setView([31.430795, 34.586064], 13);

  new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> - Maziz!',
    crossOrigin: "anonymous",
  }).addTo(map);

  return map;
}

async function showStopsOnMap(map: LeafletMap, stops: Stop[]) {
  const busLeafletIcon = new LeafletIcon({
    iconUrl: "../media/directions-bus.png",
  });

  stops.forEach((stop) =>
    new Marker([stop.stopLat, stop.stopLon], {
      title: stop.stopName,
      icon: busLeafletIcon,
    }).addTo(map),
  );

  return stops;
}

function setupLocationSearch(
  elementId: string,
  stops: Stop[],
  map: LeafletMap,
) {
  const locationSearchDiv = document.getElementById(elementId);
  const locationSearchInput = locationSearchDiv?.getElementsByTagName(
    "input",
  )[0] as HTMLInputElement | undefined;
  const locationSearchList = locationSearchDiv?.getElementsByTagName(
    "ul",
  )[0] as HTMLUListElement | undefined;

  locationSearchInput?.addEventListener("input", () => {
    console.log(locationSearchInput.value);
    locationSearchList?.replaceChildren();
    console.log(stops.length);
    stops.forEach((stop) => {
      if (
        locationSearchInput.value &&
        stop.stopName?.startsWith(locationSearchInput.value)
      ) {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = stop.stopName;
        btn.onclick = () => {
          console.log("panning...");
          map.panTo({ lon: stop.stopLon, lat: stop.stopLat });
        };
        li.appendChild(btn);
        locationSearchList?.appendChild(li);
      }
    });
  });

  locationSearchInput?.addEventListener("focusout", () => {
    setTimeout(() => {
      locationSearchList?.replaceChildren();
    }, 1000);
  });
}

async function main() {
  initializeSqlite();

  const gtfsStops = await gtfsFunctionImplementation.getStops();
  const map = initializeLeaflet();

  const northEastLat: number = 31.46747147083975;
  const northEastLon: number = 34.660148620605476;
  const southWestLat: number = 31.394234718031928;
  const southWestLon: number = 34.51200485229493;

  const stops = await showStopsOnMap(
    map,
    gtfsStops,
    // gtfsStops.filter(
    //   (s) =>
    //     s.stopLat >= southWestLat &&
    //     s.stopLat <= northEastLat &&
    //     s.stopLon >= southWestLon &&
    //     s.stopLon <= northEastLon,
    // ),
  );

  setupLocationSearch("location-search", stops, map);
}

await main();
