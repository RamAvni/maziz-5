import { OPEN_BUS_API_URL, OPEN_BUS_DB_URL } from "../consts/index.mjs";
import type { FieldTypes, GtfsPackage, Stop } from "gtfs";

// Helpers

function urlParamObjectToString(opts: Record<string, any>) {
  let urlParams = "";
  for (let [key, value] of Object.entries(opts)) {
    if (value instanceof Date) value = value.toISOString();
    if (value) urlParams += `${key}=${value}&`;
  }
  if (urlParams) urlParams = "?" + urlParams.slice(0, -1); // remove last &
  return urlParams;
}

// Open-bus specific helper functions
interface getGTFSStopsListOpts {
  limit?: number;
  offset?: number;
  get_count?: boolean;
  date_from?: string;
  date_to?: string;
  code?: number;
  city?: string;
}
async function getGTFSStopsList(opts: getGTFSStopsListOpts): Promise<Stop[]> {
  const urlParams = urlParamObjectToString(opts);
  const resBody = (await (
    await fetch(OPEN_BUS_API_URL + "/gtfs_stops/list" + urlParams)
  ).json()) as Record<string, any>[];
  return resBody.map((stop) => ({
    stopId: stop.id,
    stopLat: stop.lat,
    stopLon: stop.lon,
    stopCode: stop.code,
    stopName: stop.name,
    // stop.city !
    // stop.date !
  }));
}

type getGTFSRideStopsListOpts = (
  | { gtfs_ride_ids: string }
  | {
      arrival_time_from: Date;
      arrival_time_to: Date;
    }
) & {
  limit?: number;
  offset?: number;
  get_count?: boolean;
  arrival_time_from?: Date;
  arrival_time_to?: Date;
  gtfs_stops_ids?: string;
  gtfs_ride_ids?: string;
  gtfs_ride__gtfs_route_id?: number;
  gtfs_ride__journey_ref_prefix?: string;
  gtfs_ride__start_time_from?: Date;
  gtfs_ride__start_time_to?: Date;
  gtfs_stop__date_from?: Date;
  gtfs_stop__date_to?: Date;
  gtfs_stop__code?: number;
  gtfs_stop__city?: string;
  gtfs_route__date_from?: Date;
  gtfs_route__date_to?: Date;
  gtfs_route__line_refs?: string;
  gtfs_route__operator_refs?: string;
  gtfs_route__route_short_name?: string;
  gtfs_route__route_long_name_contains?: string;
  gtfs_route__route_mkt?: string;
  gtfs_route__route_direction?: string;
  gtfs_route__route_alternative?: string;
  gtfs_route__agency_name?: string;
  gtfs_route__route_type?: string;
  order_by?: string;
};
async function getGTFSRideStopsList(opts: getGTFSRideStopsListOpts) {
  const urlParams = urlParamObjectToString(opts);
  return fetch(OPEN_BUS_API_URL + "/gtfs_ride_stops/list" + urlParams);
}

interface getSIRIRideStopsListOpts {
  limit?: number;
  offset?: number;
  get_count?: boolean;
  siri_stops_ids?: string;
  siri_ride_ids?: string;
  siri_vehicle_location__lon__greater_or_equal?: number;
  siri_vehicle_location__lon__lower_or_equal?: number;
  siri_vehicle_location__lat__greater_or_equal?: number;
  siri_vehicle_location__lat__lower_or_equal?: number;
  siri_vehicle_location__recorded_at_time_from?: Date;
  siri_vehicle_location__recorded_at_time_to?: Date;
  siri_ride__scheduled_start_time_from?: Date;
  siri_ride__scheduled_start_time_to?: Date;
  gtfs_stop__lat__greater_or_equal?: number;
  gtfs_stop__lat__lower_or_equal?: number;
  gtfs_stop__lon__greater_or_equal?: number;
  gtfs_stop__lon__lower_or_equal?: number;
  // gtfs_date_from?: Date;
  // gtfs_date_to?: Date;
  /** Of the ISO format: YYYY-MM-DD */
  gtfs_date_from?: string;
  /** Of the ISO format: YYYY-MM-DD */
  gtfs_date_to?: string;
  order_by?: string;
}

type getSIRIRideStopsListReturn = {
  id: number;
  siri_stop_id: number;
  siri_ride_id: number;
  order: number;
  gtfs_stop_id: number;
  nearest_siri_vehicle_location_id: number;
  siri_stop__code: number;
  siri_ride__siri_route_id: number;
  siri_ride__journey_ref: string;
  siri_ride__scheduled_start_time: "2026-11-17T19:51:14.134Z";
  siri_ride__vehicle_ref: string;
  siri_ride__updated_first_last_vehicle_locations: "2026-11-17T19:51:14.134Z";
  siri_ride__first_vehicle_location_id: number;
  siri_ride__last_vehicle_location_id: number;
  siri_ride__updated_duration_minutes: "2026-11-17T19:51:14.134Z";
  siri_ride__duration_minutes: number;
  siri_ride__journey_gtfs_ride_id: number;
  siri_ride__route_gtfs_ride_id: number;
  siri_ride__gtfs_ride_id: number;
  gtfs_stop__date: "2026-11-17";
  gtfs_stop__code: number;
  gtfs_stop__lat: number;
  gtfs_stop__lon: number;
  gtfs_stop__name: string;
  gtfs_stop__city: string;
  nearest_siri_vehicle_location__siri_snapshot_id: number;
  nearest_siri_vehicle_location__siri_ride_stop_id: number;
  nearest_siri_vehicle_location__recorded_at_time: "2026-11-17T19:51:14.134Z";
  nearest_siri_vehicle_location__lon: number;
  nearest_siri_vehicle_location__lat: number;
  nearest_siri_vehicle_location__bearing: number;
  nearest_siri_vehicle_location__velocity: number;
  nearest_siri_vehicle_location__distance_from_journey_start: number;
  nearest_siri_vehicle_location__distance_from_siri_ride_stop_meters: number;
  gtfs_ride_stop__gtfs_stop_id: number;
  gtfs_ride_stop__gtfs_ride_id: number;
  gtfs_ride_stop__arrival_time: "2026-11-17T19:51:14.134Z";
  gtfs_ride_stop__departure_time: "2026-11-17T19:51:14.134Z";
  gtfs_ride_stop__stop_sequence: number;
  gtfs_ride_stop__pickup_type: number;
  gtfs_ride_stop__drop_off_type: number;
  gtfs_ride_stop__shape_dist_traveled: number;
  gtfs_ride__gtfs_route_id: number;
  gtfs_ride__journey_ref: string;
  gtfs_ride__start_time: "2026-11-17T19:51:14.134Z";
  gtfs_ride__end_time: "2026-11-17T19:51:14.134Z";
  gtfs_route__date: "2026-11-17";
  gtfs_route__line_ref: number;
  gtfs_route__operator_ref: number;
  gtfs_route__route_short_name: string;
  gtfs_route__route_long_name: string;
  gtfs_route__route_mkt: string;
  gtfs_route__route_direction: string;
  gtfs_route__route_alternative: string;
  gtfs_route__agency_name: string;
  gtfs_route__route_type: string;
}[];
async function getSIRIRideStopsList(
  opts: getSIRIRideStopsListOpts,
): Promise<getSIRIRideStopsListReturn> {
  const urlParams = urlParamObjectToString(opts);
  return (
    await fetch(OPEN_BUS_API_URL + "/siri_ride_stops/list" + urlParams)
  ).json();
}

// Exported Stantardized GtfsPackage type:

async function getStops() {
  // TODO: remove temporary date magic number
  return [
    ...(await getGTFSStopsList({
      date_from: "2026-11-23",
      date_to: "2026-11-23",
      limit: 10000,
      offset: 0,
    })),
    ...(await getGTFSStopsList({
      date_from: "2026-11-23",
      date_to: "2026-11-23",
      limit: 10000,
      offset: 10000,
    })),
    ...(await getGTFSStopsList({
      date_from: "2026-11-23",
      date_to: "2026-11-23",
      limit: 10000,
      offset: 20000,
    })),
    ...(await getGTFSStopsList({
      date_from: "2026-11-23",
      date_to: "2026-11-23",
      limit: 10000,
      offset: 30000,
    })),
  ];
}

/** NOTE: The returned stops' data is according to OpenBus gtfs' data, and NOT the siri data.
 TODO: do an actual radius and not whatever this is
* */
async function getStopsByRadius(
  lon: FieldTypes["Longitude"],
  lat: FieldTypes["Latitude"],
  radius: number,
) {
  const lonMinimum = lon + radius / 100;
  const lonMaximum = lon - radius / 100;
  const latMinimum = lat - radius / 100;
  const latMaximum = lat + radius / 100;

  const openBusStopListByRadius = await getSIRIRideStopsList({
    gtfs_stop__lat__greater_or_equal: latMinimum,
    gtfs_stop__lat__lower_or_equal: latMaximum,
    gtfs_stop__lon__greater_or_equal: lonMinimum,
    gtfs_stop__lon__lower_or_equal: lonMaximum,
  });
  console.log(openBusStopListByRadius);
  return openBusStopListByRadius.map((openBusStop) => ({
    stopId: String(openBusStop.gtfs_ride_stop__gtfs_stop_id),
    stopLat: openBusStop.gtfs_stop__lat,
    stopLon: openBusStop.gtfs_stop__lon,
    stopCode: String(openBusStop.gtfs_stop__code),
    stopName: openBusStop.gtfs_stop__name,
  }));
}

async function getStopsByCordBounds(
  northEastLat: number,
  northEastLon: number,
  southWestLat: number,
  southWestLon: number,
) {
  const openBusStopListByRadius = await getSIRIRideStopsList({
    gtfs_stop__lat__greater_or_equal: southWestLat,
    gtfs_stop__lat__lower_or_equal: northEastLat,
    gtfs_stop__lon__greater_or_equal: southWestLon,
    gtfs_stop__lon__lower_or_equal: northEastLon,
    gtfs_date_from: "2026-11-23", // TODO: temporary magic number
    gtfs_date_to: "2026-11-23",
    limit: 10000,
  });

  const result: Stop[] = [];
  for (const openBusStop of openBusStopListByRadius) {
    const isDuplicate = result.find(
      (s) => s.stopCode === String(openBusStop.gtfs_stop__code),
    );

    if (!isDuplicate)
      result.push({
        stopId: String(openBusStop.gtfs_ride_stop__gtfs_stop_id),
        stopLat: openBusStop.gtfs_stop__lat,
        stopLon: openBusStop.gtfs_stop__lon,
        stopCode: String(openBusStop.gtfs_stop__code),
        stopName: openBusStop.gtfs_stop__name,
      });
  }

  return result;
}

export const gtfsFunctionImplementation: GtfsPackage = {
  getStops,
  getStopsByRadius,
  getStopsByCordBounds,
};
