import { FieldTypes } from "./index.mjs";

interface Stop {
  stopId: FieldTypes["ID"];
  stopCode?: FieldTypes["Text"];
  stopName?: FieldTypes["Text"];
  ttsStopName?: FieldTypes["Text"];
  stopDesc?: FieldTypes["Text"];
  stopLat: FieldTypes["Latitude"];
  stopLon: FieldTypes["Longitude"];
  zoneId?: FieldTypes["ID"];
  stopUrl?: FieldTypes["URL"];
  locationType?: FieldTypes["Enum"];
  parentStation?: FieldTypes["ID"];
  stopTimezone?: FieldTypes["Timezone"];
  wheelchairBoarding?: FieldTypes["Enum"];
  levelId?: FieldTypes["ID"];
  platformCode?: FieldTypes["Text"];
  stopAccess?: FieldTypes["Enum"];
}

export interface GtfsPackage {
  getStops: () => Promise<Stop[]>;

  getStopsByRadius: (
    lon: number,
    lat: number,
    radius: number,
  ) => Promise<Stop[]>;

  /** NOTE: If you have the GTFS stops already, it will be better to filter the longitude and latitudes yourself; as functions do not store state, and might need to perform extra network calls. */
  getStopsByCordBounds: (
    northEastLat: number,
    northEastLon: number,
    southWestLat: number,
    southWestLon: number,
  ) => Promise<Stop[]>;
}
