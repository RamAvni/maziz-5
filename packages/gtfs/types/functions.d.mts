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
  getStationsByRadius: (
    lon: number,
    lat: number,
    radius: number,
  ) => Promise<Stop[]>;

    getStationsByCordBounds: (
        northEastLat: number,
        northEastLon: number,
        southWestLat: number,
        southWestLon: number,
    ) =>  Promise<Stop[]>
}
