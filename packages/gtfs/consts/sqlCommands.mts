import { datasetFileNames } from "./datasetFileNames.mjs";

export const tableNames = {
  agency: "agency",
  stop: "stop",
  route: "route",
  trip: "trip",
  stop_time: "stop_time",
  calendar: "calendar",
  calendar_date: "calendar_date",
  fare_attribute: "fare_attribute",
  fare_rule: "fare_rule",
  timeframe: "timeframe",
  rider_category: "rider_category",
  fare_media: "fare_media",
  fare_product: "fare_product",
  fare_leg_rule: "fare_leg_rule",
  fare_leg_join_rule: "fare_leg_join_rule",
  fare_transfer_rule: "fare_transfer_rule",
  area: "area",
  stop_area: "stop_area",
  network: "network",
  route_network: "route_network",
  shape: "shape",
  frequency: "frequency",
  transfer: "transfer",
  pathway: "pathway",
  level: "level",
  location_group: "location_group",
  location_group_stop: "location_group_stop",
  location: "location",
  booking_rule: "booking_rule",
  translations: "translations",
  feedInfo: "feedInfo",
  attributions: "attributions",
} as const;

export type TableName = (typeof tableNames)[keyof typeof tableNames];

export const fileNamesToTableNames: Record<
  (typeof datasetFileNames)[keyof typeof datasetFileNames],
  TableName
> = {
  "agency.txt": "agency",
  "stops.txt": "stop",
  "routes.txt": "route",
  "trips.txt": "trip",
  "stop_times.txt": "stop_time",
  "calendar.txt": "calendar",
  "calendar_dates.txt": "calendar_date",
  "fare_attributes.txt": "fare_attribute",
  "fare_rules.txt": "fare_rule",
  "timeframes.txt": "timeframe",
  "rider_categories.txt": "rider_category",
  "fare_media.txt": "fare_media",
  "fare_products.txt": "fare_product",
  "fare_leg_rules.txt": "fare_leg_rule",
  "fare_leg_join_rules.txt": "fare_leg_join_rule",
  "fare_transfer_rules.txt": "fare_transfer_rule",
  "areas.txt": "area",
  "stop_areas.txt": "stop_area",
  "networks.txt": "network",
  "route_networks.txt": "route_network",
  "shapes.txt": "shape",
  "frequencies.txt": "frequency",
  "transfers.txt": "transfer",
  "pathways.txt": "pathway",
  "levels.txt": "level",
  "location_groups.txt": "location_group",
  "location_group_stops.txt": "location_group_stop",
  "locations.geojson": "location",
  "booking_rules.txt": "booking_rule",
  "translations.txt": "translations",
  "feed_info.txt": "feedInfo",
  "attributions.txt": "attributions",
};

export const sqlCreateTableCommands: Record<TableName, string> = {
  // NOTE: agency_url should be NOT NULL, but mot is mot and.. welp.
  agency: `CREATE TABLE agency
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		agency_id TEXT NOT NULL,
		agency_name TEXT NOT NULL,
		agency_url TEXT NULL,
		agency_timezone TEXT NOT NULL,
		agency_lang TEXT NULL,
		agency_phone TEXT NULL,
		agency_fare_url TEXT NULL,
		agency_email TEXT NULL,
		cemv_support INTEGER CHECK( cemv_support IN (0, 1, 2)) NULL
	)`,
  stop: `CREATE TABLE stop 
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		stop_id TEXT NOT NULL,
		stop_code TEXT NULL,
		stop_name TEXT NULL,
		tts_stop_name TEXT NULL,
		stop_desc TEXT NULL,
		stop_lat REAL NULL,
		stop_lon REAL NULL,
		zone_id TEXT NULL,
		stop_url TEXT NULL,
		location_type INTEGER CHECK( location_type IN (0, 1, 2, 3, 4)) NULL,
		parent_station TEXT NULL,
		stop_timezone TEXT NULL,
		wheelchair_boarding INTEGER CHECK( wheelchair_boarding IN (0, 1, 2)) NULL,
		level_id TEXT NULL,
		platform_code TEXT NULL,
		stop_access INTEGER CHECK( stop_access IN (0, 1)) NULL,

		FOREIGN KEY(parent_station) REFERENCES stop(stop_id),
		FOREIGN KEY(level_id) REFERENCES level(level_id)
	)`,
  // TODO: 8 or 715 shouldn't be here. fucking mot
  // TODO: seems like route_id get's cut in the beginning
  route: `CREATE TABLE route 
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		route_id TEXT NOT NULL,
		agency_id TEXT NOT NULL,
		route_short_name TEXT NULL,
		route_long_name TEXT NULL,
		route_desc TEXT NULL,
		route_type INTEGER CHECK( route_type IN (0, 1, 2, 3, 4, 5, 6, 7, 11, 12, 8, 715)) NOT NULL,
		route_url TEXT NULL,
		route_color TEXT NULL,
		route_text_color TEXT NULL,
		route_sort_order INTEGER NULL,
		continuous_pickup INTEGER CHECK( continuous_pickup IN (0, 1, 2, 3)) NULL,
		continuous_drop_off INTEGER CHECK( continuous_drop_off IN (0, 1, 2, 3)) NULL,
		network_id TEXT NULL,
		cemv_support INTEGER CHECK( cemv_support IN (0, 1, 2)) NULL,

		FOREIGN KEY(agency_id) REFERENCES agency(agency_id)
	)`,
  // TODO: Look into service_id - "Foreign ID referencing calendar.service_id **or** calendar_dates.service_id"
  trip: `CREATE TABLE trip
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		route_id TEXT NOT NULL,
		service_id TEXT NOT NULL,
		trip_id TEXT NOT NULL,
		trip_headsign TEXT NULL,
		trip_short_name TEXT NULL,
		direction_id INTEGER CHECK( direction_id IN (0, 1)) NOT NULL,
		block_id TEXT NULL,
		shape_id TEXT NULL,
		wheelchair_accessible INTEGER CHECK( wheelchair_accessible IN (0, 1, 2)) NULL,
		bikes_allowed INTEGER CHECK( bikes_allowed IN (0, 1, 2)) NULL,
		cars_allowed INTEGER CHECK( cars_allowed IN (0, 1, 2)) NULL,
		safe_duration_factor REAL NULL,
		safe_duration_offset REAL NULL,

		FOREIGN KEY(route_id) REFERENCES route(route_id),
		FOREIGN KEY(service_id) REFERENCES calendar(service_id),
		FOREIGN KEY(shape_id) REFERENCES shape(shape_id)
	)`,
  stop_time: `CREATE TABLE stop_time
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		trip_id TEXT NOT NULL,
		arrival_time TEXT NULL,
		departure_time TEXT NULL,
		stop_id TEXT NULL,
		location_group_id TEXT NULL,
		location_id TEXT NULL,
		stop_sequence INTEGER NOT NULL,
		stop_headsign TEXT NULL,
		start_pickup_drop_off_window TEXT NULL,
		end_pickup_drop_off_window TEXT NULL,
		pickup_type INTEGER CHECK( pickup_type IN (0, 1, 2, 3)) NULL,
		drop_off_type INTEGER CHECK( drop_off_type IN (0, 1, 2, 3)) NULL,
		continuous_pickup INTEGER CHECK( continuous_pickup IN (0, 1, 2, 3)) NULL,
		continuous_drop_off INTEGER CHECK( continuous_drop_off IN (0, 1, 2, 3)) NULL,
		shape_dist_traveled REAL NULL,
		timepoint INTEGER CHECK( timepoint IN (0, 1)) NULL,
		pickup_booking_rule_id TEXT NULL,
		drop_off_booking_rule_id TEXT NULL,


		FOREIGN KEY(trip_id) REFERENCES trip(trip_id),
		FOREIGN KEY(stop_id) REFERENCES stop(stop_id),
		FOREIGN KEY(location_group_id) REFERENCES location_groups(location_group_id),
		FOREIGN KEY(location_id) REFERENCES location(geojson),
		FOREIGN KEY(pickup_booking_rule_id) REFERENCES booking_rule(booking_rule_id),
		FOREIGN KEY(drop_off_booking_rule_id) REFERENCES booking_rule(booking_rule_id)
	)`,
  calendar: `CREATE TABLE calendar
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		service_id TEXT NOT NULL,
		monday INTEGER CHECK( monday IN (0, 1)) NOT NULL,
		tuesday INTEGER CHECK( tuesday IN (0, 1)) NOT NULL,
		wednesday INTEGER CHECK( wednesday IN (0, 1)) NOT NULL,
		thursday INTEGER CHECK( thursday IN (0, 1)) NOT NULL,
		friday INTEGER CHECK( friday IN (0, 1)) NOT NULL,
		saturday INTEGER CHECK( saturday IN (0, 1)) NOT NULL,
		sunday INTEGER CHECK( sunday IN (0, 1)) NOT NULL,
		start_date TEXT NOT NULL,
		end_date TEXT NOT NULL
	)`,
  calendar_date: `CREATE TABLE calendar_date
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		service_id TEXT NOT NULL,
		date TEXT NOT NULL,
		exception_type INTEGER CHECK( exception_type IN (1, 2)) NOT NULL,

		FOREIGN KEY(service_id) REFERENCES calendar(service_id)
	)`,
  fare_attribute: `CREATE TABLE fare_attribute
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		fare_id TEXT NOT NULL,
		price REAL NOT NULL,
		currency_type TEXT NOT NULL,
		payment_method CHECK( payment_method IN (0, 1)) NOT NULL,
		transfers CHECK( transfers IN (0, 1, 2)) NOT NULL,
		agency_id TEXT NULL,
		transfer_duration INTEGER NULL,

		FOREIGN KEY(agency_id) REFERENCES agency(agency_id)
	)`,
  fare_rule: `CREATE TABLE fare_rule
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		fare_id TEXT NOT NULL,
		route_id TEXT NULL,
		origin_id TEXT NULL,
		destination_id TEXT NULL,
		contains_id TEXT NULL,

		FOREIGN KEY(fare_id) REFERENCES fare_attribute(fare_id),
		FOREIGN KEY(route_id) REFERENCES route(route_id),
		FOREIGN KEY(origin_id) REFERENCES stop(zone_id),
		FOREIGN KEY(destination_id) REFERENCES stop(zone_id),
		FOREIGN KEY(contains_id) REFERENCES stop(zone_id)
	)`,

  // TODO: Look into service_id - "Foreign ID referencing calendar.service_id **or** calendar_dates.service_id"
  timeframe: `CREATE TABLE timeframe
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timeframe_group_id TEXT NOT NULL,
		end_time TEXT NULL,
		service_id TEXT NOT NULL,

		FOREIGN KEY(service_id) REFERENCES calendar(service_id)
	)`,
  rider_category: `CREATE TABLE rider_category
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		rider_category_id TEXT NOT NULL,
		rider_category_name TEXT NOT NULL,
		is_default_fare_category INTEGER CHECK(is_default_fare_category IN (0, 1)) NOT NULL,
		eligibility_url TEXT NULL
	)`,
  fare_media: `CREATE TABLE fare_media
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		fare_media_id TEXT NOT NULL,
		fare_media_name TEXT NULL,
		fare_media_type INTEGER CHECK(fare_media_type IN (0, 1, 2, 3, 4)) NOT NULL
	)`,
  fare_product: `CREATE TABLE fare_product
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		fare_product_id TEXT NOT NULL,
		fare_product_name TEXT NULL,
		rider_category_id TEXT NULL,
		fare_media_id TEXT NULL,
		amount INTEGER NOT NULL,
		currency TEXT NOT NULL,

		FOREIGN KEY(rider_category_id) REFERENCES rider_category(rider_category_id),
		FOREIGN KEY(fare_meida_id) REFERENCES fare_media(fare_media_id)
	)`,

  // TODO: Look into network_id - "Foreign ID referencing routes.network_id or networks.network_id"
  fare_leg_rule: `CREATE TABLE fare_leg_rule
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		leg_group_id TEXT NULL,
		network_id TEXT NULL,
		from_area_id TEXT NULL,
		to_area_id TEXT NULL,
		from_timeframe_group_id TEXT NULL,
		to_timeframe_group_id TEXT NULL,
		fare_product_id TEXT NOT NULL,
		rule_priority INTEGER NULL,

		FOREIGN KEY(rider_category_id) REFERENCES rider_category(rider_category_id),
		FOREIGN KEY(network_id) REFERENCES route(network_id),
		FOREIGN KEY(to_area_id) REFERENCES area(area_id),
		FOREIGN KEY(from_timeframe_group_id) REFERENCES timeframe(timeframe_group_id),
		FOREIGN KEY(to_timeframe_group_id) REFERENCES timeframe(timeframe_group_id),
		FOREIGN KEY(fare_product_id) REFERENCES fare_product(fare_product_id)
	)`,
  // TODO: Look into from_network_id or to_network_id - "Foreign ID referencing routes.network_id or networks.network_id"
  fare_leg_join_rule: `CREATE TABLE fare_leg_join_rule
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		from_network_id TEXT NOT NULL,
		to_network_id TEXT NOT NULL,
		from_stop_id TEXT NULL,
		to_stop_id TEXT NULL,

		FOREIGN KEY(from_network_id) REFERENCES route(network_id),
		FOREIGN KEY(to_network_id) REFERENCES route(network_id),
		FOREIGN KEY(from_stop_id) REFERENCES stop(stop_id),
		FOREIGN KEY(to_stop_id) REFERENCES stop(stop_id)
	)`,
  fare_transfer_rule: `CREATE TABLE fare_transfer_rule
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		from_leg_group_id TEXT NULL,
		to_leg_group_id TEXT NULL,
		transfer_count INTEGER NULL,
		duration_limit INTEGER NULL,
		duration_limit_type INTEGER CHECK(duration_limit_type IN (0, 1, 2, 3)) NULL,
		fare_transfer_type INTEGER CHECK(fare_transfer_type IN (0, 1, 2)) NULL,
		fare_product_id TEXT NULL,
		

		FOREIGN KEY(from_leg_group_id) REFERENCES fare_leg_rule(leg_group_id),
		FOREIGN KEY(to_leg_group_id) REFERENCES fare_leg_rule(leg_group_id),
		FOREIGN KEY(fare_product_id) REFERENCES fare_product(fare_product_id)
	)`,
  area: `CREATE TABLE area
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		area_id TEXT NOT NULL,
		area_name TEXT NULL
	)`,
  stop_area: `CREATE TABLE stop_area
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		area_id TEXT NOT NULL,
		stop_id TEXT NOT NULL,

		FOREIGN KEY(area_id) REFERENCES area(area_id),
		FOREIGN KEY(stop_id) REFERENCES stop(stop_id)
	)`,
  network: `CREATE TABLE network 
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		network_id TEXT NOT NULL,
		route_id TEXT NOT NULL,

		FOREIGN KEY(network_id) REFERENCES network(network_id),
		FOREIGN KEY(route_id) REFERENCES route(route_id)
	)`,
  route_network: `CREATE TABLE route_network 
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		network_id TEXT NOT NULL,
		route_id TEXT NOT NULL,

		FOREIGN KEY(network_id) REFERENCES network(network_id),
		FOREIGN KEY(route_id) REFERENCES route(route_id)
	)`,
  shape: `CREATE TABLE shape
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		shape_id TEXT NOT NULL,
		shape_pt_lat REAL NOT NULL,
		shape_pt_lon REAL NOT NULL,
		shape_pt_sequence INTEGER NOT NULL,
		shape_dist_traveled REAL NULL
	)`,
  frequency: `CREATE TABLE frequency
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		trip_id TEXT NOT NULL,
		start_time TEXT NOT NULL,
		end-time TEXT NOT NULL,
		headway_secs INTEGER NOT NULL,
		exact_times INTEGER CHECK( exact_times IN (0, 1)) NULL

	)`,
  transfer: `CREATE TABLE transfer
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		from_stop_id TEXT NULL,
		to_stop_id TEXT NULL,
		from_route_id TEXT NULL,
		to_route_id TEXT NULL,
		from_trip_id TEXT NULL,
		to_trip_id TEXT NULL,
		transfer_type INTEGER CHECK(transfer_type IN (0, 1, 2, 3, 4, 5)) NOT NULL,
		min_transfer_type INTEGER NULL,

		FOREIGN KEY(from_stop_id) REFERENCES stop(stop_id),
		FOREIGN KEY(to_stop_id) REFERENCES stop(stop_id),
		FOREIGN KEY(from_route_id) REFERENCES route(route_id),
		FOREIGN KEY(to_route_id) REFERENCES route(route_id),
		FOREIGN KEY(to_trip_id) REFERENCES trip(trip_id)
	)`,
  pathway: `CREATE TABLE pathway
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		primary_id TEXT NOT NULL,
		from_stop_id TEXT NULL,
		to_stop_id TEXT NULL,
		pathway_mode INTEGER CHECK(transfer_type IN (0, 1, 2, 3, 4, 5, 6)) NOT NULL,
		is_bidirectional INTEGER CHECK(transfer_type IN (0, 1)) NOT NULL,
		length REAL NULL,
		transversal_time INTEGER NULL,
		stair_count INTEGER NULL,
		max_slope REAL NULL,
		min_width REAL NULL,
		signposted_as TEXT NULL,
		reversed_signposted_as TEXT NULL,
		
		FOREIGN KEY(from_stop_id) REFERENCES stop(stop_id),
		FOREIGN KEY(to_stop_id) REFERENCES stop(stop_id)
	)`,
  level: `CREATE TABLE level
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		level_id TEXT NOT NULL,
		level_index REAL NOT NULL,
		level_name TEXT NULL
	)`,
  location_group: `CREATE TABLE level
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		location_groups_id TEXT NOT NULL,
		location_group_name TEXT NULL
	)`,
  location_group_stop: `CREATE TABLE location_group_stop
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		location_groups_id TEXT NOT NULL,
		stop_id TEXT NULL,

		FOREIGN KEY(stop_id) REFERENCES stop(stop_id)
	)`,
  location: "locations: TODO: this should trigger an error on purpose",
  booking_rule: `CREATE TABLE booking_rule
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		booking_rule_id TEXT NOT NULL,
		booking_type TEXT CHECK(booking_type IN (0, 1)) NOT NULL
		prior_notice_duration_min INTEGER NULL,
		prior_notice_duration_max INTEGER NULL,
		prior_notice_last_day INTEGER NULL,
		prior_notice_last_time TEXT NULL,
		prior_notice_start_day INTEGER NULL,
		prior_notice_start_time TEXT NULL,
		prior_notice_service_id TEXT NULL,
		message TEXT NULL,
		pickup_message TEXT NULL,
		drop_off_message TEXT NULL,
		phone_number TEXT NULL,
		info_url TEXT NULL,
		booking_url TEXT NULL,


		FOREIGN KEY(stop_id) REFERENCES stop(stop_id),
		FOREIGN KEY(prior_notice_service_id) REFERENCES calendar(service_id)
	)`,
  // NOTE: Any file added to GTFS will have a table_name value equivalent to the file name, as listed above (i.e., not including the .txt file extension).
  translations: `CREATE TABLE translations
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		table_name TEXT CHECK( table_name IN ('agency', 'stops', 'routes', 'trips', 'stop_times', 'pathways', 'levels', 'feed_info', 'attributions')) NOT NULL,
		field_name TEXT NOT NULL,
		language TEXT NOT NULL,
		translation TEXT NOT NULL,
		record_id TEXT NULL,
		record_sub_id TEXT NULL,
		field_value TEXT NULL
	)`,
  feedInfo: `CREATE TABLE feed_info
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		feed_publisher_name TEXT NOT NULL,
		feed_publisher_url TEXT NOT NULL,
		feed_lang TEXT NOT NULL,
		default_lang TEXT NULL,
		feed_start_date TEXT NULL,
		feed_end_date TEXT NULL,
		feed_version TEXT NULL,
		feed_contact_email TEXT NULL,
		feed_contact_url TEXT NULL
	)`,
  attributions: `CREATE TABLE attribute
	(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		attribute_id TEXT NULL,
		agency_id TEXT NULL,
		route_id TEXT NULL,
		trip_id TEXT NULL,
		organization_name TEXT NOT NULL,
		is_producer INTEGER CHECK(is_producer IN (0, 1)) NULL,
		is_operator INTEGER CHECK(is_operator IN (0, 1)) NULL,
		is_authority INTEGER CHECK(is_authority IN (0, 1)) NULL,
		attribution_url TEXT NULL,
		attribution_email TEXT NULL,
		attribution_phone TEXT NULL,

		FOREIGN KEY(agency_id) REFERENCES agency(agency_id)
		FOREIGN KEY(route_id) REFERENCES route(route_id)
		FOREIGN KEY(trip_id) REFERENCES trip(trip_id)
	)`,
};
