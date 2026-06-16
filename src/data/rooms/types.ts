export const ROOM_KEYS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"] as const;

export type RoomKey = (typeof ROOM_KEYS)[number];

export interface RoomDefinition {
  key: RoomKey;
  folder: string;
  photos: string[];
}
