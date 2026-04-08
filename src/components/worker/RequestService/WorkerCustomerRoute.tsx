import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { ENV } from "@/config/env/env";

type Location = {
  lat: number;
  lng: number;
};

type Props = {
  workerLocation: Location;
  customerLocation: Location;
};

// <- Example local icon: your uploaded file path (will be converted to URL by your environment)
const WORKER_ICON_URL = "/mnt/data/545c9016-1892-4494-997a-95ea170d4248.png";

// small default icons
const workerIcon = L.icon({
  iconUrl: WORKER_ICON_URL,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const customerIcon = L.icon({
  iconUrl: WORKER_ICON_URL, // replace with another image if you want different icon
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

export default function WorkerCustomerRoute({
  workerLocation,
  customerLocation,
}: Props) {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workerLocation || !customerLocation) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchRoute = async () => {
      setLoading(true);
      setError(null);
      setRoute([]);
      setDistance("");
      setDuration("");

      try {
        // Use env var instead of hardcoding token:
        // For Vite: import.meta.env.VITE_ORS_BEARER
        // For CRA: process.env.REACT_APP_ORS_BEARER
        const ORS_BEARER =ENV.VITE_ORS_BEARER
          

        if (!ORS_BEARER) {
          setError("ORS Bearer token is not configured (set env var).");
          setLoading(false);
          return;
        }

        const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${workerLocation.lng},${workerLocation.lat}&end=${customerLocation.lng},${customerLocation.lat}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${ORS_BEARER}`,
            Accept: "application/json",
          },
          signal,
        });

        if (!res.ok) {
          // try to read body for more details
          const text = await res.text().catch(() => "");
          throw new Error(`ORS request failed: ${res.status} ${res.statusText} ${text}`);
        }

        const data = await res.json();

        // guard the shape
        const feature = data?.features?.[0];
        if (!feature || !feature.geometry?.coordinates) {
          throw new Error("No route found in ORS response.");
        }

        const coords: [number, number][] = feature.geometry.coordinates.map((c: any) => [c[1], c[0]]);
        setRoute(coords);

        const summary = feature.properties?.summary;
        if (summary) {
          setDistance((summary.distance / 1000).toFixed(2) + " km");
          setDuration(Math.round(summary.duration / 60) + " mins");
        } else {
          setDistance("");
          setDuration("");
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          // aborted, ignore
        } else {
          setError(err.message || "Failed to fetch route.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();

    return () => {
      controller.abort();
    };
  }, [workerLocation, customerLocation]);

  return (
    <div className="relative w-full h-56">
      <MapContainer
        center={workerLocation}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={workerLocation} icon={workerIcon}>
          <Popup>You (Worker)</Popup>
        </Marker>

        <Marker position={customerLocation} icon={customerIcon}>
          <Popup>Customer</Popup>
        </Marker>

        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>

      <div className="absolute bottom-2 left-2 bg-white px-3 py-1 rounded shadow text-xs">
        {loading ? (
          <p>Loading route...</p>
        ) : error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : (
          <>
            <p>Distance: {distance || "—"}</p>
            <p>Arrival: {duration || "—"}</p>
          </>
        )}
      </div>
    </div>
  );
}
