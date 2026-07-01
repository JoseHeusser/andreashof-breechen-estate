/** Stable ids — must match `locationSec.nearby[].id` in locale files. */
export type NearbyPlaceId =
  | "kosenow-see"
  | "stralsund"
  | "zarrentiner-see"
  | "greifswalder-bodden"
  | "eldena-ruins"
  | "greifswald-harbour"
  | "cdf-centre"
  | "jarmen-centre"
  | "peenefeeling"
  | "shopping"
  | "usedom";

export const ANDREASHOF: [number, number] = [53.9317716, 13.3530925];

/** Approximate coordinates for map markers (OpenStreetMap / Nominatim). */
export const NEARBY_COORDS: Record<NearbyPlaceId, [number, number]> = {
  "kosenow-see": [53.991, 13.756],
  stralsund: [54.3093, 13.0818],
  "zarrentiner-see": [53.9215, 13.352],
  "greifswalder-bodden": [54.092, 13.418],
  "eldena-ruins": [54.0789, 13.4493],
  "greifswald-harbour": [54.0961, 13.3765],
  "cdf-centre": [54.0958, 13.3811],
  "jarmen-centre": [53.9175, 13.3467],
  // Hafeninsel Jarmen — Peenefeeling boat rental, on the Peene next to the B96 bridge.
  peenefeeling: [53.9192, 13.3434],
  shopping: [53.988, 13.762],
  usedom: [53.976, 14.05],
};

export const NEARBY_FOCUS_ZOOM: Partial<Record<NearbyPlaceId, number>> = {
  stralsund: 11,
  usedom: 10,
};
