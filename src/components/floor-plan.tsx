import { useEffect, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { planInfo } from "@/lib/plan-info";
import {
  FLOOR_KEYS,
  FLOOR_PLANS,
  isSpace,
  PLAN_KEYS,
  ROOM_FLOOR,
  type FloorKey,
  type FloorPlan as FloorPlanData,
  type PlanDoor,
  type PlanKey,
  type PlanShape,
} from "@/data/floor-plan";

/* Colours come from the site tokens so the drawing follows the theme. */
const FILL = {
  room: "var(--linen)",
  roomHover: "var(--accent)",
  roomActive: "var(--sage-deep)",
  open: "var(--card)",
  bath: "color-mix(in oklab, var(--sage) 16%, var(--card))",
  bathLinked: "color-mix(in oklab, var(--sage) 55%, var(--card))",
  wall: "var(--foreground)",
} as const;

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const FADE = { transition: `fill 350ms ${EASE}, opacity 350ms ${EASE}` };

function Shape({ shape, ...rest }: { shape: PlanShape } & React.SVGProps<SVGElement>) {
  if (typeof shape === "string") {
    return <polygon points={shape} {...(rest as React.SVGProps<SVGPolygonElement>)} />;
  }
  const [x, y, width, height] = shape;
  return (
    <rect x={x} y={y} width={width} height={height} {...(rest as React.SVGProps<SVGRectElement>)} />
  );
}

/** Width and height of a room, used to size and wrap its label. */
function shapeSize(shape: PlanShape): [number, number] {
  if (typeof shape !== "string") return [shape[2], shape[3]];
  const points = shape.split(" ").map((pair) => pair.split(",").map(Number));
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
}

const NAME_SIZE = 40;
const NAME_LEADING = 44;
const NAME_CHAR = 22; // average glyph advance of the serif at NAME_SIZE

/** Breaks a room name at spaces and after hyphens so it fits inside the room. */
function wrapName(name: string, width: number): string[] {
  const max = Math.max(8, Math.floor((width - 56) / NAME_CHAR));
  const parts = name.split(/(?<=-)|\s+/);
  const lines: string[] = [];
  for (const part of parts) {
    const last = lines[lines.length - 1];
    const glue = last && !last.endsWith("-") ? " " : "";
    if (last && (last + glue + part).length <= max) lines[lines.length - 1] = last + glue + part;
    else lines.push(part);
  }
  return lines;
}

/** Door leaf plus the quarter circle it sweeps, as in an architect's drawing. */
function doorPath({ axis, pos, from, to, swing }: PlanDoor): string {
  const r = to - from;
  if (axis === "h") {
    const sweep = swing === 1 ? 0 : 1;
    return `M${from} ${pos}V${pos + swing * r}A${r} ${r} 0 0 ${sweep} ${to} ${pos}`;
  }
  const sweep = swing === 1 ? 1 : 0;
  return `M${pos} ${from}H${pos + swing * r}A${r} ${r} 0 0 ${sweep} ${pos} ${to}`;
}

interface FloorPlanProps {
  active: PlanKey;
  onSelect: (room: PlanKey) => void;
}

/**
 * The house as an architect's sheet: pick a floor, pick a room on the drawing
 * or in the index below it. Drawing and index highlight each other.
 */
export function FloorPlan({ active, onSelect }: FloorPlanProps) {
  const { t } = useTranslation();
  const [floor, setFloor] = useState<FloorKey>(ROOM_FLOOR[active]);
  const [hovered, setHovered] = useState<PlanKey | null>(null);

  // Follow the selection when it changes (index entry on the other floor).
  useEffect(() => {
    setFloor(ROOM_FLOOR[active]);
  }, [active]);

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <p className="eyebrow pb-3 max-sm:hidden">{t("zimmer.plan.eyebrow")}</p>

        <div role="tablist" aria-label={t("zimmer.plan.eyebrow")} className="flex gap-7">
          {FLOOR_KEYS.map((key) => {
            const selected = key === floor;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`plan-tab-${key}`}
                aria-selected={selected}
                aria-controls={`plan-panel-${key}`}
                onClick={() => {
                  setFloor(key);
                  setHovered(null);
                }}
                className={`group relative min-h-11 pb-3 text-[11px] uppercase tracking-[0.24em] outline-none transition-colors duration-300 focus-visible:text-sage-deep ${
                  selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(`zimmer.plan.floors.${key}`)}
                <span
                  className={`absolute bottom-0 left-0 h-px bg-sage-deep transition-all duration-500 ${
                    selected
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-5 group-hover:opacity-60"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* The sheet */}
      <figure className="-mx-5 border-y border-border bg-card px-2 pb-4 pt-5 sm:mx-0 sm:border-x sm:px-6 sm:pb-5 sm:pt-7 md:px-8">
        <div className="relative aspect-[2360/1650] w-full">
          {FLOOR_KEYS.map((key) => (
            <FloorDrawing
              key={key}
              plan={FLOOR_PLANS[key]}
              visible={key === floor}
              active={active}
              hovered={hovered}
              onHover={setHovered}
              onSelect={onSelect}
            />
          ))}
        </div>

        <figcaption className="mx-3 mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border pt-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:mx-0">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 max-sm:hidden">
            <LegendItem label={t("zimmer.plan.legend.room")} style={{ background: FILL.room }} />
            <LegendItem label={t("zimmer.plan.legend.bath")} style={{ background: FILL.bath }} />
            <LegendItem
              label={t("zimmer.plan.legend.service")}
              style={{
                background:
                  "repeating-linear-gradient(45deg, var(--border) 0 1px, var(--muted) 1px 5px)",
              }}
            />
          </ul>
          <span className="font-display text-sm normal-case italic tracking-normal">
            {t("zimmer.plan.sheet")} · {t(`zimmer.plan.floors.${floor}`)} ·{" "}
            {t("zimmer.plan.notToScale")}
          </span>
        </figcaption>
      </figure>

      {/* Phones and small tablets: step through the rooms; the plan above follows */}
      <RoomStepper active={active} onSelect={onSelect} />

      {/* Register of all rooms, from md up */}
      <nav
        aria-label={t("zimmer.selectorLabel")}
        className="mt-10 hidden grid-cols-2 gap-x-12 md:grid"
      >
        {FLOOR_KEYS.map((key) => (
          <div key={key}>
            <p className="border-b border-border pb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              {t(`zimmer.plan.floors.${key}`)}
            </p>
            <ul>
              {FLOOR_PLANS[key].rooms.map(({ key: room }) => {
                const info = planInfo(t, room);
                const isActive = room === active;
                const isHovered = room === hovered;
                return (
                  <li key={room} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => onSelect(room)}
                      onPointerEnter={() => setHovered(room)}
                      onPointerLeave={() => setHovered(null)}
                      aria-current={isActive ? "true" : undefined}
                      aria-label={isSpace(room) ? info.name : `${room}. ${info.name}`}
                      className={`flex w-full items-baseline gap-4 py-3 text-left outline-none transition-colors duration-300 hover:text-foreground focus-visible:text-sage-deep ${
                        isActive || isHovered ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`w-8 shrink-0 font-display text-lg italic ${
                          isActive ? "text-sage-deep" : "text-sage-deep/70"
                        }`}
                      >
                        {isSpace(room) ? "—" : room}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[1.05rem] leading-tight">
                          {info.name}
                        </span>
                        <span className="mt-0.5 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {info.sub}
                        </span>
                      </span>
                      <span
                        className={`h-px shrink-0 self-center bg-sage-deep transition-all duration-500 ${
                          isActive
                            ? "w-7 opacity-100"
                            : isHovered
                              ? "w-3 opacity-60"
                              : "w-0 opacity-0"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

/**
 * Previous / next through all eleven rooms. Rooms are small tap targets on a
 * phone-sized plan, so this is the comfortable way to browse there.
 */
function RoomStepper({ active, onSelect }: FloorPlanProps) {
  const { t } = useTranslation();
  const index = PLAN_KEYS.indexOf(active);
  const { name } = planInfo(t, active);
  const step = (delta: number) =>
    onSelect(PLAN_KEYS[(index + delta + PLAN_KEYS.length) % PLAN_KEYS.length]);
  const arrow =
    "flex size-12 shrink-0 items-center justify-center text-sage-deep outline-none transition-colors active:bg-accent focus-visible:bg-accent";

  return (
    <div className="-mx-5 flex items-stretch border-b border-border bg-card sm:mx-0 sm:border-x md:hidden">
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label={t("zimmer.plan.prev")}
        className={`${arrow} border-r border-border`}
      >
        <Chevron direction="left" />
      </button>
      <p
        className="flex min-w-0 flex-1 items-baseline justify-center gap-3 px-3 py-3"
        aria-live="polite"
      >
        {!isSpace(active) && (
          <span className="font-display text-xl italic text-sage-deep">{active}</span>
        )}
        <span className="truncate font-display text-lg leading-tight">{name}</span>
        <span className="shrink-0 text-[10px] tracking-[0.18em] text-muted-foreground">
          {index + 1}/{PLAN_KEYS.length}
        </span>
      </p>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label={t("zimmer.plan.next")}
        className={`${arrow} border-l border-border`}
      >
        <Chevron direction="right" />
      </button>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d={direction === "left" ? "M14.5 5.5 8 12l6.5 6.5" : "M9.5 5.5 16 12l-6.5 6.5"} />
    </svg>
  );
}

function LegendItem({ label, style }: { label: string; style: React.CSSProperties }) {
  return (
    <li className="flex items-center gap-2">
      <span className="size-2.5 border border-foreground/30" style={style} aria-hidden="true" />
      {label}
    </li>
  );
}

interface FloorDrawingProps {
  plan: FloorPlanData;
  visible: boolean;
  active: PlanKey;
  hovered: PlanKey | null;
  onHover: (room: PlanKey | null) => void;
  onSelect: (room: PlanKey) => void;
}

function FloorDrawing({ plan, visible, active, hovered, onHover, onSelect }: FloorDrawingProps) {
  const { t } = useTranslation();
  const hatchId = `plan-hatch-${plan.key}`;
  const focusRoom = plan.rooms.find((room) => room.key === (hovered ?? active));
  const linkedBath = focusRoom?.bath;
  const hoverOnThisFloor = plan.rooms.some((room) => room.key === hovered);

  const onKey = (event: KeyboardEvent<SVGGElement>, room: PlanKey) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect(room);
  };

  return (
    <svg
      id={`plan-panel-${plan.key}`}
      role="tabpanel"
      aria-labelledby={`plan-tab-${plan.key}`}
      aria-label={t("zimmer.plan.ariaPlan", { floor: t(`zimmer.plan.floors.${plan.key}`) })}
      aria-hidden={visible ? undefined : true}
      viewBox={plan.viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={`absolute inset-0 h-full w-full select-none transition-[opacity,transform] duration-500 motion-reduce:transition-none ${
        visible ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
      style={{ transitionTimingFunction: EASE }}
    >
      <defs>
        <pattern
          id={hatchId}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="20" height="20" fill="var(--muted)" />
          <line x1="0" y1="0" x2="0" y2="20" stroke="var(--border)" strokeWidth="4" />
        </pattern>
      </defs>

      {/* Static areas */}
      {plan.areas.map((area) => {
        const fill =
          area.kind === "service"
            ? `url(#${hatchId})`
            : area.kind === "bath"
              ? area.id === linkedBath
                ? FILL.bathLinked
                : FILL.bath
              : FILL.open;
        return <Shape key={area.id} shape={area.shape} fill={fill} style={FADE} />;
      })}

      {/* Stairs */}
      <g fill="var(--card)" stroke="var(--stone)" strokeWidth="3">
        {plan.stairs.map(({ box: [x, y, w, h], steps }) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={w} height={h} />
            {Array.from({ length: steps - 1 }, (_, i) => {
              const lineY = y + ((i + 1) * h) / steps;
              return <line key={i} x1={x} x2={x + w} y1={lineY} y2={lineY} />;
            })}
          </g>
        ))}
      </g>

      {/* Guest rooms and selectable shared spaces */}
      {plan.rooms.map((room) => {
        const isActive = room.key === active;
        const isHovered = room.key === hovered;
        const dimmed = hoverOnThisFloor && !isHovered && !isActive;
        const space = isSpace(room.key);
        const { name } = planInfo(t, room.key);
        const [width, height] = shapeSize(room.shape);
        const lines = wrapName(name, width);
        // Short rooms (V) shrink the numeral so numeral and name both clear the walls.
        const numeral = Math.round(
          Math.min(118, height * 0.4, (height - 64 - lines.length * NAME_LEADING) / 0.72),
        );
        const block = numeral * 0.72 + 16 + lines.length * NAME_LEADING;
        const top = room.at[1] - block / 2;
        const ink = isActive ? "var(--primary-foreground)" : "var(--foreground)";
        return (
          <g
            key={room.key}
            role="button"
            tabIndex={visible ? 0 : -1}
            aria-label={space ? name : t("zimmer.plan.ariaRoom", { key: room.key, name })}
            aria-pressed={isActive}
            onClick={() => onSelect(room.key)}
            onKeyDown={(event) => onKey(event, room.key)}
            onPointerEnter={() => onHover(room.key)}
            onPointerLeave={() => onHover(null)}
            onFocus={() => onHover(room.key)}
            onBlur={() => onHover(null)}
            className="group/room cursor-pointer outline-none"
          >
            <Shape
              shape={room.shape}
              fill={
                isActive
                  ? FILL.roomActive
                  : isHovered
                    ? FILL.roomHover
                    : space
                      ? FILL.open
                      : FILL.room
              }
              style={FADE}
            />
            {/* Keyboard focus ring, wide enough to show inside the walls */}
            <Shape
              shape={room.shape}
              fill="none"
              stroke="var(--ring)"
              strokeWidth="40"
              strokeOpacity="0.6"
              className="opacity-0 group-focus-visible/room:opacity-100"
            />
            <g
              textAnchor="middle"
              fontFamily="var(--font-display)"
              opacity={dimmed ? 0.4 : 1}
              style={FADE}
            >
              {space ? (
                <>
                  <text
                    x={room.at[0]}
                    y={room.at[1]}
                    dominantBaseline="central"
                    fontStyle="italic"
                    fontSize={68}
                    fill={isActive ? "var(--primary-foreground)" : "var(--sage-deep)"}
                    style={FADE}
                    className="max-sm:text-[82px]"
                  >
                    {name}
                  </text>
                </>
              ) : (
                <>
                  <text
                    x={room.at[0]}
                    y={top + numeral * 0.72}
                    fontStyle="italic"
                    fontSize={numeral}
                    fill={isActive ? "var(--primary-foreground)" : "var(--sage-deep)"}
                    style={FADE}
                    className="max-sm:hidden"
                  >
                    {room.key}
                  </text>
                  {/* Phones: the numeral alone, larger and centred in the room */}
                  <text
                    x={room.at[0]}
                    y={room.at[1]}
                    dominantBaseline="central"
                    fontStyle="italic"
                    fontSize={Math.min(170, Math.round(height * 0.52))}
                    fill={isActive ? "var(--primary-foreground)" : "var(--sage-deep)"}
                    style={FADE}
                    className="sm:hidden"
                  >
                    {room.key}
                  </text>
                  {/* Names would be unreadable at phone size; the chips below carry them */}
                  <text fontSize={NAME_SIZE} fill={ink} style={FADE} className="max-sm:hidden">
                    {lines.map((line, i) => (
                      <tspan
                        key={line}
                        x={room.at[0]}
                        y={top + numeral * 0.72 + 16 + (i + 0.78) * NAME_LEADING}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                </>
              )}
            </g>
          </g>
        );
      })}

      {/* Door swings */}
      <g fill="none" stroke="var(--stone)" strokeWidth="3" pointerEvents="none">
        {plan.doors.map((door) => (
          <path key={`${door.axis}-${door.pos}-${door.from}`} d={doorPath(door)} />
        ))}
      </g>

      {/* Walls */}
      <path d={plan.walls} fill={FILL.wall} pointerEvents="none" />
      {plan.extraWalls?.map((wall) => (
        <path
          key={wall.d}
          d={wall.d}
          fill="none"
          stroke={FILL.wall}
          strokeWidth={wall.width}
          strokeLinecap="square"
          pointerEvents="none"
        />
      ))}

      {/* Main entrance */}
      {plan.entrance && (
        <path
          d={`M${plan.entrance[0]} ${plan.entrance[1]} l-24 38 h48 z`}
          fill="var(--sage-deep)"
          pointerEvents="none"
        />
      )}

      {/* Annotations for everything that is not a guest room */}
      <g
        pointerEvents="none"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        style={{ textTransform: "uppercase" }}
        className="max-sm:hidden"
      >
        {plan.labels.map((label) => (
          <text
            key={`${label.key}-${label.at.join("-")}`}
            x={label.at[0]}
            y={label.at[1]}
            fontSize={label.major ? 34 : 26}
            letterSpacing={label.major ? 8 : 5}
            fill={label.major ? "var(--foreground)" : "var(--muted-foreground)"}
            stroke={label.key === "stairs" ? "var(--card)" : undefined}
            strokeWidth={label.key === "stairs" ? 14 : undefined}
            paintOrder="stroke"
          >
            {t(`zimmer.plan.labels.${label.key}`)}
          </text>
        ))}
      </g>
    </svg>
  );
}
