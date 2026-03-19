// src/components/dashboard/ClientsMap.jsx
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import clientService from "../../services/clientService";
import ClientDetailsModal from "../clients/ClientDetailsModal";

// Create a modern, custom HTML marker using Tailwind classes
const createCustomIcon = (name) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full border-[3px] border-white shadow-[0_8px_15px_-3px_rgba(79,70,229,0.4)] text-white font-bold text-sm transition-transform duration-300 hover:scale-110 hover:z-50">
        ${name.charAt(0).toUpperCase()}
        <div class="absolute -bottom-1.5 w-2 h-2 bg-purple-700 rounded-full shadow-sm"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    tooltipAnchor: [0, -45], // Position tooltip perfectly above the custom icon
  });
};

const ClientsMap = () => {
  // eslint-disable-next-line no-unused-vars
  const [clients, setClients] = useState([]);
  const [geocodedClients, setGeocodedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geocodingProgress, setGeocodingProgress] = useState({
    current: 0,
    total: 0,
  });

  const [selectedClient, setSelectedClient] = useState(null);

  // Default center (Tunisia/Métlaoui region)
  const defaultCenter = [34.3333, 8.4];

  useEffect(() => {
    fetchAndGeocodeClients();
  }, []);

  const fetchAndGeocodeClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients();
      const fetchedClients = response.data || response;
      setClients(fetchedClients);

      const clientsWithAddress = fetchedClients.filter(
        (c) =>
          c.address &&
          (c.address.city || c.address.street || c.address.country),
      );

      setGeocodingProgress({ current: 0, total: clientsWithAddress.length });

      const mappedClients = [];

      for (let i = 0; i < clientsWithAddress.length; i++) {
        const client = clientsWithAddress[i];
        const addr = client.address;
        const searchQuery =
          `${addr.street || ""}, ${addr.city || ""}, ${addr.state || ""}, ${addr.country || ""}`
            .replace(/,\s*,/g, ",")
            .trim();

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
          );
          const data = await res.json();

          if (data && data.length > 0) {
            mappedClients.push({
              ...client,
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          }
        } catch (error) {
          console.error(`Failed to geocode client ${client.name}`, error);
        }

        setGeocodingProgress({
          current: i + 1,
          total: clientsWithAddress.length,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setGeocodedClients(mappedClients);
    } catch (err) {
      console.error("Error loading map data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative h-162.5 flex flex-col overflow-hidden group">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-20 -mt-20 z-0"></div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-2xl">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-800 font-semibold mt-6 text-lg tracking-tight">
            Mapping Your Clients
          </p>
          {geocodingProgress.total > 0 && (
            <div className="mt-4 w-64">
              <div className="flex justify-between text-xs text-gray-500 font-medium mb-1.5">
                <span>Locating addresses</span>
                <span>
                  {Math.round(
                    (geocodingProgress.current / geocodingProgress.total) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-linear-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(geocodingProgress.current / geocodingProgress.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full rounded-2xl overflow-hidden relative z-10 shadow-inner">
          <MapContainer
            center={defaultCenter}
            zoom={6}
            style={{
              height: "100%",
              width: "100%",
              backgroundColor: "#f8fafc",
            }}
          >
            {/* CARTO Positron (Light) theme for a very clean, Apple-like aesthetic */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            />

            {geocodedClients.map((client) => (
              <Marker
                key={client._id}
                position={[client.lat, client.lng]}
                icon={createCustomIcon(client.name)}
                eventHandlers={{
                  click: () => setSelectedClient(client),
                }}
              >
                <Tooltip
                  direction="top"
                  className="custom-modern-tooltip"
                  opacity={1}
                >
                  <div className="px-2 py-1 text-center font-sans">
                    <p className="font-bold text-gray-900 text-sm m-0">
                      {client.name}
                    </p>
                    {client.company && (
                      <p className="text-[11px] text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">
                        {client.company}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                      Click to view profile
                    </p>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Action / Legend */}
          <div className="absolute bottom-6 right-6 z-400 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 pointer-events-none">
            <div className="flex -space-x-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 border border-white"></div>
              <div className="w-3 h-3 rounded-full bg-purple-500 border border-white"></div>
            </div>
            <span className="text-xs font-semibold text-gray-600">
              {geocodedClients.length} Clients Mapped
            </span>
          </div>
        </div>
      )}

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

export default ClientsMap;
