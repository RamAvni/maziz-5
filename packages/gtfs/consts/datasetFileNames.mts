/**
 * As specified in: {@link https://gtfs.org/documentation/schedule/reference/#dataset-files|here.}
 * May be extended as desired if other files are included
 *
 * TODO: implement the conditional
 */
export const datasetFileNames = {
  agency: "agency.txt" as const,
  /** NOTE: Optional if demand-responsive zones are defined in locations.geojson. */
  stops: "stops.txt" as const,
  routes: "routes.txt" as const,
  trips: "trips.txt" as const,
  stop_times: "stop_times.txt" as const,

  /** NOTE: Required unless all dates of service are defined in calendar_dates.txt. */
  calendar: "calendar.txt" as const,
  /** NOTE: Required if calendar.txt is omitted. In which case calendar_dates.txt must contain all dates of service. */
  calendar_dates: "calendar_dates.txt" as const,

  fare_attributes: "fare_attributes.txt" as const,
  fare_rules: "fare_rules.txt" as const,
  timeframes: "timeframes.txt" as const,
  rider_categories: "rider_categories.txt" as const,
  fare_media: "fare_media.txt" as const,
  fare_products: "fare_products.txt" as const,
  fare_leg_rules: "fare_leg_rules.txt" as const,
  fare_leg_join_rules: "fare_leg_join_rules.txt" as const,
  fare_transfer_rules: "fare_transfer_rules.txt" as const,

  areas: "areas.txt" as const,
  stop_areas: "stop_areas.txt" as const,

  /** Forbidden if network_id exists in routes.txt. */
  networks: "networks.txt" as const,
  /** Forbidden if network_id exists in routes.txt. */
  route_networks: "route_networks.txt" as const,

  shapes: "shapes.txt" as const,
  frequencies: "frequencies.txt" as const,
  transfers: "transfers.txt" as const,
  pathways: "pathways.txt" as const,
  /** NOTE: Required when describing pathways with elevators (pathway_mode=5). */
  levels: "levels.txt" as const,

  location_groups: "location_groups.txt" as const,
  location_group_stops: "location_group_stops.txt" as const,
  locations: "locations.geojson" as const,
  booking_rules: "booking_rules.txt" as const,
  translations: "translations.txt" as const,
  /** NOTE: Required if translations.txt is provided. */
  feedInfo: "feed_info.txt" as const,

  attributions: "attributions.txt" as const,
};
