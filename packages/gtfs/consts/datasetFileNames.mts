/**
 * As specified in: {@link https://gtfs.org/documentation/schedule/reference/#dataset-files|here.}
 * May be extended as desired if other files are included
 *
 * TODO: implement the conditional
 */
export const datasetFileNames = {
  agencies: "agencies.txt",
  /** NOTE: Optional if demand-responsive zones are defined in locations.geojson. */
  stops: "stops.txt",
  routes: "routes.txt",
  trips: "trips.txt",
  stopTimes: "stop_times.txt",

  /** NOTE: Required unless all dates of service are defined in calendar_dates.txt. */
  calendar: "calendar.txt",
  /** NOTE: Required if calendar.txt is omitted. In which case calendar_dates.txt must contain all dates of service. */
  calendarDates: "calendar_dates.txt",

  fareAttributes: "fare_attributes.txt",
  fareRules: "fare_rules.txt",
  timeframes: "timeframes.txt",
  riderCategories: "rider_categories.txt",
  fareMedia: "fare_media.txt",
  fareProducts: "fare_products.txt",
  fareLegRules: "fare_leg_rules.txt",
  fareLegJoinRules: "fare_leg_join_rules.txt",
  fareTransferRules: "fare_transfer_rules.txt",

  areas: "areas.txt",
  stopAreas: "stop_areas.txt",

  /** Forbidden if network_id exists in routes.txt. */
  networks: "networks.txt",
  /** Forbidden if network_id exists in routes.txt. */
  routeNetworks: "route_networks.txt",

  shapes: "shapes.txt",
  frequencies: "frequencies.txt",
  transfers: "transfers.txt",
  pathways: "pathways.txt",
  /** NOTE: Required when describing pathways with elevators (pathway_mode=5). */
  levels: "levels.txt",

  locationGroups: "location_groups.txt",
  locationGroupStops: "location_group_stops.txt",
  locations: "locations.geojson",
  bookingRules: "booking_rules.txt",
  translations: "translations.txt",
  /** NOTE: Required if translations.txt is provided. */
  feedInfo: "feed_info.txt",

  attributions: "attributions.txt",
};
