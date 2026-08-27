export * from "./datasetFiles";

/**
 * FIELD TYPES
 * As specified in: {@link https://gtfs.org/documentation/schedule/reference/#field-types|here.}
 * Usage of these is recommended.
 */
export interface FieldTypes {
  /** NOTE: The leading "#" must not be included */
  Color: string;
  /** TODO: currencyCode and currencyAmount interface */
  CurrencyCode: never;
  CurrencyAmount: never;
  Date: Date;
  Email: string;
  /** TODO: NOTE: An option from a set of predefined constants defined in the "Description" column. */
  Enum: never;
  ID: string;
  /** An IETF BCP 47 language code */
  LanguageCode: string;
  /** NOTE: The value must be greater than or equal to -90.0 and less than or equal to 90.0. */
  Latitude: number;
  /** NOTE: The value must be greater than or equal to -180.0 and less than or equal to 180.0. */
  Longitude: number;

  /** @deprecated redundant */
  Float: number;
  /** @deprecated redundant */
  Integer: number;
  PhoneNumber: string;
  /** NOTE: In the HH:MM:SS format (H:MM:SS is also accepted). May also denote the next day*/
  Time: string;
  /** NOTE: Time in the HH:MM:SS format (H:MM:SS is also accepted). Represents a wall-clock time shown in the local time of the specified location. */
  LocalTime: string;
  /** @deprecated redundant */
  Text: string;
  /** NOTE: TZ timezone from the {@link https://www.iana.org/time-zones|Iana time zones.} */
  Timezone: string;
  /** @deprecated redundant */
  URL: Return<URL.toString>;
}
