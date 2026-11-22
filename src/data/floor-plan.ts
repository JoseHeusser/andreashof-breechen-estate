import type { RoomKey } from "./rooms/types";
import { WALLS_EG, WALLS_OG } from "./floor-plan-walls";

/**
 * Interactive floor plan of the manor house, traced from the architect's
 * drawings (Grundriss Erdgeschoss / Obergeschoss). All coordinates live in the
 * pixel space of those drawings; the SVG viewBox does the scaling.
 */

export type FloorKey = "eg" | "og";

/** Either a rectangle [x, y, width, height] or a polygon "x,y x,y …". */
export type PlanShape = [number, number, number, number] | string;

/** Keys into `zimmer.plan.labels` in the locale files. */
export type PlanLabelKey =
  "bath" | "wc" | "hall" | "entrance" | "stairs" | "kitchen" | "living" | "dining" | "annex";

/** Shared rooms that can be selected on the plan just like a guest room. */
export type SpaceKey = "salon";

/** Anything selectable on the plan. */
export type PlanKey = RoomKey | SpaceKey;

export const SPACE_IMAGES: Record<SpaceKey, string[]> = {
  salon: ["/galerie/salon-02.jpg", "/gallery/salon-second-a.jpg", "/gallery/dining.jpg"],
};

export const isSpace = (key: PlanKey): key is SpaceKey => key in SPACE_IMAGES;

export interface PlanRoom {
  key: PlanKey;
  shape: PlanShape;
  /** Centre of the numeral. */
  at: [number, number];
  /** Id of the bathroom reached from this room, if the drawing shows one. */
  bath?: string;
}

export interface PlanArea {
  id: string;
  /** bath = wet rooms · open = hallways and shared rooms · service = not part of the guest area */
  kind: "bath" | "open" | "service";
  shape: PlanShape;
}

export interface PlanLabel {
  key: PlanLabelKey;
  at: [number, number];
  /** Larger type for the shared rooms guests actually look for. */
  major?: boolean;
}

export interface PlanStairs {
  /** [x, y, width, height] */
  box: [number, number, number, number];
  steps: number;
}

/**
 * A door leaf with its swing. `axis` is the direction of the wall it sits in:
 * "h" = horizontal wall at y=`pos`, opening from x=`from` to x=`to`;
 * "v" = vertical wall at x=`pos`, opening from y=`from` to y=`to`.
 * `swing` is +1 (down / right) or -1 (up / left); the hinge is at `from`.
 */
export interface PlanDoor {
  axis: "h" | "v";
  pos: number;
  from: number;
  to: number;
  swing: 1 | -1;
}

export interface FloorPlan {
  key: FloorKey;
  viewBox: string;
  walls: string;
  /** Wall pieces the tracer cannot express as rectangles (diagonals). */
  extraWalls?: { d: string; width: number }[];
  rooms: PlanRoom[];
  areas: PlanArea[];
  labels: PlanLabel[];
  stairs: PlanStairs[];
  doors: PlanDoor[];
  /** Tip of the "main entrance" arrow, pointing up into the house. */
  entrance?: [number, number];
}

const GROUND_FLOOR: FloorPlan = {
  key: "eg",
  viewBox: "20 10 2360 1650",
  walls: WALLS_EG,
  extraWalls: [{ d: "M1748 462 L1808 402 M1748 455 V545", width: 10 }],
  rooms: [
    { key: "I", shape: [1251, 1257, 434, 323], at: [1468, 1420], bath: "eg-bath-east" },
    { key: "II", shape: [1685, 1257, 333, 323], at: [1851, 1420], bath: "eg-bath-east" },
    { key: "III", shape: [518, 1257, 417, 323], at: [726, 1420], bath: "eg-bath-south" },
    { key: "IV", shape: [191, 848, 327, 409], at: [354, 1052], bath: "eg-bath-north" },
    { key: "V", shape: [191, 1257, 327, 189], at: [354, 1352], bath: "eg-bath-north" },
    // The blue salon: shared, but selectable like a room
    { key: "salon", shape: [845, 640, 501, 441], at: [1096, 860] },
  ],
  areas: [
    // Annex (not part of the guest area)
    { id: "eg-annex-top", kind: "service", shape: [1624, 40, 731, 171] },
    { id: "eg-annex-mid", kind: "service", shape: [1624, 211, 606, 189] },
    { id: "eg-annex-east", kind: "service", shape: [1925, 400, 305, 236] },
    { id: "eg-annex-south", kind: "service", shape: [2010, 636, 220, 187] },
    { id: "eg-annex-lobby", kind: "open", shape: [1624, 400, 301, 236] },
    // Hall, stairwell and entrance form one connected space
    {
      id: "eg-hall",
      kind: "open",
      shape:
        "1346,640 1591,640 1591,1257 1251,1257 1251,1580 935,1580 935,1257 518,1257 518,1081 1346,1081",
    },
    { id: "eg-dining", kind: "open", shape: [518, 640, 327, 441] },
    { id: "eg-kitchen", kind: "open", shape: [1591, 640, 419, 435] },
    // Wet rooms
    { id: "eg-bath-north", kind: "bath", shape: [191, 640, 327, 208] },
    { id: "eg-bath-south", kind: "bath", shape: [191, 1446, 327, 134] },
    { id: "eg-wc", kind: "bath", shape: [1591, 1075, 215, 182] },
    { id: "eg-bath-east", kind: "bath", shape: [1806, 1075, 204, 182] },
    { id: "eg-annex-wc", kind: "bath", shape: [1624, 490, 124, 146] },
  ],
  labels: [
    { key: "dining", at: [682, 868] },
    { key: "kitchen", at: [1800, 866], major: true },
    { key: "hall", at: [1100, 1178] },
    { key: "entrance", at: [1093, 1430] },
    { key: "stairs", at: [1468, 750] },
    { key: "bath", at: [412, 752] },
    { key: "bath", at: [422, 1521] },
    { key: "bath", at: [1908, 1174] },
    { key: "wc", at: [1654, 1174] },
    { key: "wc", at: [1686, 571] },
    { key: "annex", at: [2180, 134] },
  ],
  stairs: [
    { box: [1046, 422, 102, 204], steps: 7 },
    { box: [1474, 852, 106, 123], steps: 6 },
    { box: [48, 1163, 72, 134], steps: 5 },
  ],
  doors: [
    { axis: "h", pos: 848, from: 340, to: 391, swing: -1 },
    { axis: "h", pos: 1257, from: 313, to: 364, swing: -1 },
    { axis: "v", pos: 518, from: 1093, to: 1158, swing: -1 },
    { axis: "v", pos: 518, from: 1488, to: 1545, swing: 1 },
    { axis: "v", pos: 935, from: 1498, to: 1548, swing: -1 },
    { axis: "v", pos: 1251, from: 1498, to: 1548, swing: 1 },
    { axis: "v", pos: 1685, from: 1498, to: 1549, swing: 1 },
    { axis: "h", pos: 1257, from: 1852, to: 1899, swing: -1 },
    { axis: "h", pos: 1081, from: 652, to: 711, swing: -1 },
    { axis: "h", pos: 1081, from: 1071, to: 1129, swing: -1 },
    { axis: "v", pos: 1346, from: 770, to: 821, swing: -1 },
    { axis: "h", pos: 1580, from: 1062, to: 1138, swing: -1 },
  ],
  entrance: [1100, 1606],
};

const UPPER_FLOOR: FloorPlan = {
  key: "og",
  viewBox: "16 16 2368 1330",
  walls: WALLS_OG,
  rooms: [
    { key: "VI", shape: [1815, 202, 538, 418], at: [2084, 415], bath: "og-bath-vi" },
    {
      key: "VII",
      shape: "1826,620 2353,620 2353,1056 1930,1056 1930,887 1826,887",
      at: [2110, 820],
      bath: "og-bath-vii",
    },
    { key: "VIII", shape: [1096, 46, 414, 508], at: [1303, 300], bath: "og-bath-ix" },
    { key: "IX", shape: [676, 46, 420, 508], at: [886, 300], bath: "og-bath-ix" },
    { key: "X", shape: [46, 272, 419, 503], at: [255, 524], bath: "og-bath-x" },
    { key: "XI", shape: [46, 775, 419, 540], at: [255, 1045], bath: "og-bath-x" },
  ],
  areas: [
    { id: "og-store-west", kind: "service", shape: [465, 1058, 427, 257] },
    { id: "og-store-east", kind: "service", shape: [1510, 1056, 316, 259] },
    {
      id: "og-living",
      kind: "open",
      shape:
        "465,430 676,430 676,554 1820,554 1820,1056 1510,1056 1510,1315 892,1315 892,1058 465,1058",
    },
    { id: "og-stairwell", kind: "open", shape: [1510, 46, 305, 508] },
    { id: "og-attic-stairs", kind: "open", shape: [1820, 887, 110, 169] },
    { id: "og-bath-x", kind: "bath", shape: [46, 46, 419, 226] },
    { id: "og-bath-ix", kind: "bath", shape: [465, 46, 211, 384] },
    { id: "og-bath-vi", kind: "bath", shape: [1815, 46, 538, 156] },
    { id: "og-bath-vii", kind: "bath", shape: [1826, 1056, 527, 259] },
  ],
  labels: [
    { key: "living", at: [1150, 800], major: true },
    { key: "stairs", at: [1662, 298] },
    { key: "bath", at: [190, 168] },
    { key: "bath", at: [570, 243] },
    { key: "bath", at: [2156, 132] },
    { key: "bath", at: [2174, 1194] },
  ],
  stairs: [
    { box: [1530, 65, 275, 465], steps: 11 },
    { box: [1836, 895, 88, 155], steps: 6 },
  ],
  doors: [
    { axis: "h", pos: 272, from: 255, to: 309, swing: -1 },
    { axis: "h", pos: 775, from: 256, to: 308, swing: 1 },
    { axis: "v", pos: 465, from: 467, to: 525, swing: -1 },
    { axis: "v", pos: 676, from: 235, to: 289, swing: -1 },
    { axis: "v", pos: 1096, from: 132, to: 182, swing: 1 },
    { axis: "h", pos: 554, from: 706, to: 759, swing: -1 },
    { axis: "h", pos: 554, from: 1185, to: 1238, swing: -1 },
    { axis: "v", pos: 1815, from: 321, to: 402, swing: 1 },
    { axis: "h", pos: 202, from: 1983, to: 2037, swing: -1 },
    { axis: "v", pos: 1826, from: 800, to: 872, swing: 1 },
    { axis: "h", pos: 1056, from: 2031, to: 2084, swing: 1 },
  ],
};

export const FLOOR_PLANS: Record<FloorKey, FloorPlan> = {
  eg: GROUND_FLOOR,
  og: UPPER_FLOOR,
};

export const FLOOR_KEYS: FloorKey[] = ["eg", "og"];

export const ROOM_FLOOR = Object.fromEntries(
  FLOOR_KEYS.flatMap((floor) => FLOOR_PLANS[floor].rooms.map((room) => [room.key, floor])),
) as Record<PlanKey, FloorKey>;

/** Everything selectable, in walking order: ground floor first. */
export const PLAN_KEYS: PlanKey[] = FLOOR_KEYS.flatMap((floor) =>
  FLOOR_PLANS[floor].rooms.map((room) => room.key),
);

const ALL_ROOMS = FLOOR_KEYS.flatMap((floor) => FLOOR_PLANS[floor].rooms);

/** Rooms that use the same bathroom as `room` (empty = the bathroom is its own). */
export function bathMates(room: PlanKey): PlanKey[] {
  const bath = ALL_ROOMS.find((r) => r.key === room)?.bath;
  if (!bath) return [];
  return ALL_ROOMS.filter((r) => r.bath === bath && r.key !== room).map((r) => r.key);
}
