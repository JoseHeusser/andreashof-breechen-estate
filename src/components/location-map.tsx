import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
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

export function LocationMap() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Leaflet measures its container on init. If it sees 0px (lazy mount,
    // CSS not yet applied, reveal animation still mid-transition…) it only
    // paints the central tile. Repeated invalidateSize() calls cover that
    // window, and a ResizeObserver picks up any later size change.
    const intervals = [50, 200, 500, 1000, 2000].map((d) =>
      window.setTimeout(() => map.invalidateSize(), d),
    );

    let ro: ResizeObserver | undefined;
    if (wrapperRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(wrapperRef.current);
    }

    return () => {
      intervals.forEach(window.clearTimeout);
      ro?.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="map-container h-[420px] w-full overflow-hidden border border-border md:h-[520px]"
    >
      <MapContainer
        ref={mapRef}
        center={[(HOUSE[0] + GREIFSWALD[0]) / 2, (HOUSE[1] + GREIFSWALD[1]) / 2]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        whenReady={() => {
          // Initial paint sometimes still measures 0px — kick the tile
          // grid into sync once Leaflet says it's ready.
          requestAnimationFrame(() => mapRef.current?.invalidateSize());
        }}
      >
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
