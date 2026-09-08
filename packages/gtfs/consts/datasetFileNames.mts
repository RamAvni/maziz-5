/**
 * As specified in: {@link https://gtfs.org/documentation/schedule/reference/#dataset-files|here.}
 * May be extended as desired if other files are included
 *
 * TODO: implement the conditional
 */
export const datasetFileNames = {
  agency: "agency.txt",
  /** NOTE: Optional if demand-responsive zones are defined in locations.geojson. */
  stops: "stops.txt",
  routes: "routes.txt",
  trips: "trips.txt",
  stop_times: "stop_times.txt",

  /** NOTE: Required unless all dates of service are defined in calendar_dates.txt. */
  calendar: "calendar.txt",
  /** NOTE: Required if calendar.txt is omitted. In which case calendar_dates.txt must contain all dates of service. */
  calendar_dates: "calendar_dates.txt",

  fare_attributes: "fare_attributes.txt",
  fare_rules: "fare_rules.txt",
  timeframes: "timeframes.txt",
  rider_categories: "rider_categories.txt",
  fare_media: "fare_media.txt",
  fare_products: "fare_products.txt",
  fare_leg_rules: "fare_leg_rules.txt",
  fare_leg_join_rules: "fare_leg_join_rules.txt",
  fare_transfer_rules: "fare_transfer_rules.txt",

  areas: "areas.txt",
  stop_areas: "stop_areas.txt",

  /** Forbidden if network_id exists in routes.txt. */
  networks: "networks.txt",
  /** Forbidden if network_id exists in routes.txt. */
  route_networks: "route_networks.txt",

  shapes: "shapes.txt",
  frequencies: "frequencies.txt",
  transfers: "transfers.txt",
  pathways: "pathways.txt",
  /** NOTE: Required when describing pathways with elevators (pathway_mode=5). */
  levels: "levels.txt",

  location_groups: "location_groups.txt",
  location_group_stops: "location_group_stops.txt",
  locations: "locations.geojson",
  booking_rules: "booking_rules.txt",
  translations: "translations.txt",
  /** NOTE: Required if translations.txt is provided. */
  feedInfo: "feed_info.txt",

  attributions: "attributions.txt",
};
