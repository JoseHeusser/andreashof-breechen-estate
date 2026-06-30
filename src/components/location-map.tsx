import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { ANDREASHOF, NEARBY_FOCUS_ZOOM, type NearbyPlaceId } from "@/data/nearby-places";

const ADDRESS = "Peenestraße 16, 17506 Gützkow";

export type NearbyPlaceMarker = {
  id: NearbyPlaceId;
  position: [number, number];
  label: string;
};

const houseIcon = L.divIcon({
  className: "andreashof-marker",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:oklch(0.45 0.04 130);border:2px solid white;box-shadow:0 0 0 1px oklch(0.45 0.04 130);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const destinationIcon = L.divIcon({
  className: "destination-marker",
  html: `<div style="width:10px;height:10px;border-radius:9999px;background:white;border:1.5px solid oklch(0.45 0.04 130);"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

function MapFocusController({
  places,
  activePlaceId,
}: {
  places: NearbyPlaceMarker[];
  activePlaceId: NearbyPlaceId | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!activePlaceId) return;
    const place = places.find((p) => p.id === activePlaceId);
    if (!place) return;

    const zoom = NEARBY_FOCUS_ZOOM[activePlaceId] ?? (window.innerWidth < 768 ? 12 : 13);
    map.flyTo(place.position, zoom, { duration: 0.75 });
  }, [activePlaceId, map, places]);

  return null;
}

function DestinationMarker({
  place,
  isActive,
  onSelect,
}: {
  place: NearbyPlaceMarker;
  isActive: boolean;
  onSelect: (id: NearbyPlaceId) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (isActive) markerRef.current?.openPopup();
  }, [isActive]);

  return (
    <Marker
      ref={markerRef}
      position={place.position}
      icon={destinationIcon}
      eventHandlers={{
        click: () => onSelect(place.id),
      }}
    >
      <Popup closeButton={false} offset={[0, -4]}>
        {place.label}
      </Popup>
    </Marker>
  );
}

type LocationMapProps = {
  places: NearbyPlaceMarker[];
  activePlaceId: NearbyPlaceId | null;
  onPlaceSelect: (id: NearbyPlaceId) => void;
};

export function LocationMap({ places, activePlaceId, onPlaceSelect }: LocationMapProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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
      className="map-container h-[280px] w-full overflow-hidden border border-border md:h-[520px]"
    >
      <MapContainer
        ref={mapRef}
        center={ANDREASHOF}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        whenReady={() => {
          requestAnimationFrame(() => mapRef.current?.invalidateSize());
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocusController places={places} activePlaceId={activePlaceId} />
        <Marker position={ANDREASHOF} icon={houseIcon}>
          <Tooltip direction="top" offset={[0, -8]} permanent>
            Andreashof
            <br />
            {ADDRESS}
          </Tooltip>
        </Marker>
        {places.map((place) => (
          <DestinationMarker
            key={place.id}
            place={place}
            isActive={activePlaceId === place.id}
            onSelect={onPlaceSelect}
          />
        ))}
      </MapContainer>
    </div>
  );
}
