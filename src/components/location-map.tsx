import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon paths
const icon = L.divIcon({
  className: "andreashof-marker",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:oklch(0.45 0.04 130);border:2px solid white;box-shadow:0 0 0 1px oklch(0.45 0.04 130);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export function LocationMap() {
  return (
    <div className="map-container h-[420px] w-full overflow-hidden border border-border md:h-[520px]">
      <MapContainer
        center={[53.9314, 13.3513]}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[53.9314, 13.3513]} icon={icon}>
          <Popup>Andreashof Breechen</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
