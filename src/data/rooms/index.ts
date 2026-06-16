import { ALT_ROSA_KAMMER_ROOM } from "./alt-rosa-kammer";
import { GARTENSUITE_ROOM } from "./gartensuite";
import { GIEBELZIMMER_ROOM } from "./giebelzimmer";
import { HARRY_POTTER_ROOM } from "./harry-potter-zimmer";
import { HERREN_ZIMMER_ROOM } from "./herren-zimmer";
import { LANGE_MAENNER_BETTEN_ZIMMER_ROOM } from "./lange-maenner-betten-zimmer";
import { LINDENZIMMER_ROOM } from "./lindenzimmer";
import { MANSARDE_SUED_ROOM } from "./mansarde-sued";
import { OSTSEE_ZIMMER_ROOM } from "./ostsee-zimmer";
import { PRINZESSINNENZIMMER_ROOM } from "./prinzessinnenzimmer";
import { SENIOR_GUTSHAUS_ZIMMER_ROOM } from "./senior-gutshaus-zimmer";
import { ROOM_KEYS, type RoomKey } from "./types";

const ROOM_DEFINITIONS = [
  LINDENZIMMER_ROOM,
  GARTENSUITE_ROOM,
  HARRY_POTTER_ROOM,
  GIEBELZIMMER_ROOM,
  OSTSEE_ZIMMER_ROOM,
  HERREN_ZIMMER_ROOM,
  ALT_ROSA_KAMMER_ROOM,
  MANSARDE_SUED_ROOM,
  LANGE_MAENNER_BETTEN_ZIMMER_ROOM,
  SENIOR_GUTSHAUS_ZIMMER_ROOM,
  PRINZESSINNENZIMMER_ROOM,
] as const;

export { ROOM_KEYS, type RoomKey };

export const ROOM_IMAGES: Record<RoomKey, string[]> = ROOM_DEFINITIONS.reduce(
  (acc, room) => {
    acc[room.key] = room.photos;
    return acc;
  },
  {} as Record<RoomKey, string[]>,
);
