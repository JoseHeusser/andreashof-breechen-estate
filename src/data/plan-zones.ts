export type PlanLocaleLabel = {
  de: string;
  en: string;
  es: string;
};

export type PlanZone = {
  id: string;
  floor: "floor1" | "floor2";
  label: PlanLocaleLabel;
};

export const planZones: PlanZone[] = [
  { id: "floor1_room_1", floor: "floor1", label: { de: "Raum 1", en: "Room 1", es: "Habitacion 1" } },
  { id: "floor1_room_2", floor: "floor1", label: { de: "Raum 2", en: "Room 2", es: "Habitacion 2" } },
  { id: "floor1_room_3", floor: "floor1", label: { de: "Raum 3", en: "Room 3", es: "Habitacion 3" } },
  { id: "floor1_room_4", floor: "floor1", label: { de: "Raum 4", en: "Room 4", es: "Habitacion 4" } },
  { id: "floor1_room_5", floor: "floor1", label: { de: "Raum 5", en: "Room 5", es: "Habitacion 5" } },
  { id: "floor1_room_6", floor: "floor1", label: { de: "Raum 6", en: "Room 6", es: "Habitacion 6" } },
  { id: "floor1_room_7", floor: "floor1", label: { de: "Raum 7", en: "Room 7", es: "Habitacion 7" } },
  { id: "floor1_room_8", floor: "floor1", label: { de: "Raum 8", en: "Room 8", es: "Habitacion 8" } },
  { id: "floor2_room_1", floor: "floor2", label: { de: "Raum 1", en: "Room 1", es: "Habitacion 1" } },
  { id: "floor2_room_2", floor: "floor2", label: { de: "Raum 2", en: "Room 2", es: "Habitacion 2" } },
  { id: "floor2_room_3", floor: "floor2", label: { de: "Raum 3", en: "Room 3", es: "Habitacion 3" } },
  { id: "floor2_room_4", floor: "floor2", label: { de: "Raum 4", en: "Room 4", es: "Habitacion 4" } },
  { id: "floor2_room_5", floor: "floor2", label: { de: "Raum 5", en: "Room 5", es: "Habitacion 5" } },
  { id: "floor2_room_6", floor: "floor2", label: { de: "Raum 6", en: "Room 6", es: "Habitacion 6" } },
  { id: "floor2_room_7", floor: "floor2", label: { de: "Raum 7", en: "Room 7", es: "Habitacion 7" } },
  { id: "floor2_room_8", floor: "floor2", label: { de: "Raum 8", en: "Room 8", es: "Habitacion 8" } },
  { id: "floor2_room_9", floor: "floor2", label: { de: "Raum 9", en: "Room 9", es: "Habitacion 9" } },
  { id: "floor2_room_10", floor: "floor2", label: { de: "Raum 10", en: "Room 10", es: "Habitacion 10" } },
];

export const planZoneById = Object.fromEntries(planZones.map((zone) => [zone.id, zone])) as Record<
  string,
  PlanZone
>;
