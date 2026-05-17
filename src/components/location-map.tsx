import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";

const HOUSE: [number, number] = [53.9314, 13.3513];
const GREIFSWALD: [number, number] = [54.0865, 13.3923];

const houseIcon = L.divIcon({
  className: "andreashof-marker",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:oklch(0.45 0.04 130);border:2px solid white;box-shadow:0 0 0 1px oklch(0.45 0.04 130);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const cityIcon = L.divIcon({
  className: "city-marker",
  html: `<div style="width:10px;height:10px;border-radius:9999px;background:white;border:1.5px solid oklch(0.45 0.04 130);"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

/**
 * Forces Leaflet to recompute its tile grid after the container becomes
 * visible / resizes. Without this, lazy-mounted maps (or maps inside a
 * Suspense boundary that hydrates after layout settles) only paint the
 * single central tile because Leaflet measured a 0px container at init.
 */
function MapResizer({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const map = useMap();
  useEffect(() => {
    // Run after the next paint, then again shortly after to catch CSS
    // transitions / late layout changes (e.g. reveal animations).
    const raf = requestAnimationFrame(() => map.invalidateSize());
    const t = setTimeout(() => map.invalidateSize(), 350);

    // Keep reacting to any subsequent container resize.
    const el = containerRef.current;
    let ro: ResizeObserver | undefined;
    if (el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(el);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      ro?.disconnect();
    };
  }, [map, containerRef]);
  return null;
}

export function LocationMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={containerRef}
      className="map-container h-[420px] w-full overflow-hidden border border-border md:h-[520px]"
    >
      <MapContainer
        center={[(HOUSE[0] + GREIFSWALD[0]) / 2, (HOUSE[1] + GREIFSWALD[1]) / 2]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <MapResizer containerRef={containerRef} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={HOUSE} icon={houseIcon}>
          <Tooltip direction="top" offset={[0, -8]} permanent>
            Andreashof
          </Tooltip>
        </Marker>
        <Marker position={GREIFSWALD} icon={cityIcon}>
          <Tooltip direction="top" offset={[0, -6]} permanent>
            Greifswald
          </Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
}
