import type { TFunction } from "i18next";
import { ROOM_IMAGES } from "@/data/rooms";
import { isSpace, SPACE_IMAGES, type PlanKey } from "@/data/floor-plan";

export interface PlanInfo {
  name: string;
  desc: string;
  /** One-line summary under the name: the bed for a room, the audience for a shared space. */
  sub: string;
  photos: string[];
  /** Only guest rooms have these. */
  bed?: string;
  view?: string;
}

/** Texts and photos for anything selectable on the floor plan. */
export function planInfo(t: TFunction, key: PlanKey): PlanInfo {
  if (isSpace(key)) {
    const space = t(`zimmer.plan.spaces.${key}`, { returnObjects: true }) as {
      name: string;
      desc: string;
      tag: string;
    };
    return { name: space.name, desc: space.desc, sub: space.tag, photos: SPACE_IMAGES[key] };
  }
  const room = t(`rooms.${key}`, { returnObjects: true }) as {
    name: string;
    bed: string;
    view: string;
    desc: string;
  };
  return { ...room, sub: room.bed, photos: ROOM_IMAGES[key] };
}
