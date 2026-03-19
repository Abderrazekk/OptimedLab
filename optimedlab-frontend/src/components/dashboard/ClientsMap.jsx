import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";
import clientService from "../../services/clientService";
import supplierService from "../../services/supplierService";
import ClientDetailsModal from "../clients/ClientDetailsModal";
import SupplierDetailsModal from "../suppliers/SupplierDetailsModal"; // <--- IMPORTED MODAL

// --- CUSTOM MODERN ICONS ---
const createCustomIcon = (name, type) => {
  const isSupplier = type === "supplier";
  const bgGradient = isSupplier
    ? "from-emerald-500 to-teal-600"
    : "from-indigo-500 to-purple-600";
  const shadowColor = isSupplier
    ? "rgba(16, 185, 129, 0.4)"
    : "rgba(79,70,229,0.4)";
  const dotColor = isSupplier ? "bg-teal-800" : "bg-purple-800";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 bg-linear-to-br ${bgGradient} rounded-full border-[3px] border-white shadow-[0_8px_15px_-3px_${shadowColor}] text-white font-bold text-sm transition-transform duration-300 hover:scale-110 hover:z-50">
        ${name.charAt(0).toUpperCase()}
        <div class="absolute -bottom-1.5 w-2.5 h-2.5 ${dotColor} rounded-full shadow-sm border border-white"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    tooltipAnchor: [0, -45],
  });
};

const createStartIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full border-4 border-white shadow-[0_8px_20px_-3px_rgba(59,130,246,0.6)] text-white animate-bounce">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
};

// --- MAP CLICK HANDLER ---
const MapClickHandler = ({ isPickingStart, onLocationSelected }) => {
  useMapEvents({
    click: (e) => {
      if (isPickingStart) {
        onLocationSelected({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

// --- ROUTING MACHINE COMPONENT ---
const RoutingMachine = ({ start, end, onRouteCalculated }) => {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
      routeWhileDragging: false,
      addWaypoints: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [
          { color: "#4f46e5", weight: 6, opacity: 0.8, dashArray: "10, 10" },
        ],
      },
      createMarker: () => null,
    }).addTo(map);

    routingControl.on("routesfound", function (e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      onRouteCalculated({
        time: Math.round(summary.totalTime / 60),
        distance: (summary.totalDistance / 1000).toFixed(1),
      });
    });

    return () => map.removeControl(routingControl);
  }, [map, start, end, onRouteCalculated]);

  return null;
};

// --- MAIN MAP COMPONENT ---
const ClientsMap = () => {
  // eslint-disable-next-line no-unused-vars
  const [entities, setEntities] = useState([]);
  const [geocodedEntities, setGeocodedEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geocodingProgress, setGeocodingProgress] = useState({
    current: 0,
    total: 0,
  });

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null); // <--- NEW STATE

  // Routing States
  const [navMode, setNavMode] = useState(false);
  const [isPickingStart, setIsPickingStart] = useState(false);
  const [startLocation, setStartLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeSummary, setRouteSummary] = useState(null);

  const defaultCenter = [34.3333, 8.4]; // Tunisia

  useEffect(() => {
    fetchAndGeocodeData();
  }, []);

  const fetchAndGeocodeData = async () => {
    try {
      setLoading(true);
      const [clientsRes, suppliersRes] = await Promise.all([
        clientService.getClients(),
        supplierService.getSuppliers(),
      ]);

      const fetchedClients = (clientsRes.data || clientsRes).map((c) => ({
        ...c,
        entityType: "client",
      }));
      const fetchedSuppliers = (suppliersRes.data || suppliersRes).map((s) => ({
        ...s,
        entityType: "supplier",
      }));
      const allEntities = [...fetchedClients, ...fetchedSuppliers];
      setEntities(allEntities);

      const entitiesWithAddress = allEntities.filter(
        (e) =>
          e.address &&
          (e.address.city || e.address.street || e.address.country),
      );
      setGeocodingProgress({ current: 0, total: entitiesWithAddress.length });

      const mappedEntities = [];
      for (let i = 0; i < entitiesWithAddress.length; i++) {
        const entity = entitiesWithAddress[i];
        const addr = entity.address;
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
            mappedEntities.push({
              ...entity,
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          }
        } catch (error) {
          console.error(`Failed to geocode`, error);
        }

        setGeocodingProgress({
          current: i + 1,
          total: entitiesWithAddress.length,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setGeocodedEntities(mappedEntities);
    } catch (err) {
      console.error("Error loading map data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRouting = () => {
    setNavMode(true);
    setIsPickingStart(true);
    setStartLocation(null);
    setDestination(null);
    setRouteSummary(null);
  };

  const handleDisableNavigation = () => {
    setNavMode(false);
    setIsPickingStart(false);
    setStartLocation(null);
    setDestination(null);
    setRouteSummary(null);
  };

  const handleMapLocationSelected = (coords) => {
    setStartLocation(coords);
    setIsPickingStart(false);
  };

  // --- UPDATED CLICK LOGIC ---
  const handleMarkerClick = (entity) => {
    if (navMode) {
      if (startLocation) {
        setDestination({ lat: entity.lat, lng: entity.lng, name: entity.name });
      } else {
        alert(
          "Please set your start location first by clicking anywhere on the map.",
        );
      }
    } else {
      // Normal map viewing mode: open appropriate modal
      if (entity.entityType === "client") {
        setSelectedClient(entity);
      } else if (entity.entityType === "supplier") {
        setSelectedSupplier(entity);
      }
    }
  };

  return (
    <div className="bg-white p-3 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative h-175 flex flex-col overflow-hidden group">
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-2xl">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-800 font-semibold mt-6 text-lg tracking-tight">
            Mapping Partners...
          </p>
          {geocodingProgress.total > 0 && (
            <p className="text-sm font-medium text-gray-500 mt-2">
              {Math.round(
                (geocodingProgress.current / geocodingProgress.total) * 100,
              )}
              % Complete
            </p>
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
            cursor={isPickingStart ? "crosshair" : "grab"}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap &copy; CARTO"
            />

            <MapClickHandler
              isPickingStart={isPickingStart}
              onLocationSelected={handleMapLocationSelected}
            />

            {startLocation && (
              <Marker
                position={[startLocation.lat, startLocation.lng]}
                icon={createStartIcon()}
              >
                <Tooltip
                  direction="top"
                  className="custom-modern-tooltip"
                  permanent
                >
                  Your Start Point
                </Tooltip>
              </Marker>
            )}

            {navMode && startLocation && destination && (
              <RoutingMachine
                start={startLocation}
                end={destination}
                onRouteCalculated={setRouteSummary}
              />
            )}

            {geocodedEntities.map((entity) => (
              <Marker
                key={entity._id}
                position={[entity.lat, entity.lng]}
                icon={createCustomIcon(entity.name, entity.entityType)}
                eventHandlers={{ click: () => handleMarkerClick(entity) }}
              >
                <Tooltip
                  direction="top"
                  className="custom-modern-tooltip"
                  opacity={1}
                >
                  <div className="px-2 py-1 text-center font-sans">
                    <p className="font-bold text-gray-900 text-sm m-0 flex items-center justify-center gap-1.5">
                      {entity.entityType === "supplier" && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                      )}
                      {entity.name}
                    </p>
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-wider mt-0.5 ${entity.entityType === "supplier" ? "text-emerald-600" : "text-indigo-600"}`}
                    >
                      {entity.entityType === "supplier"
                        ? "Supplier"
                        : entity.company || "Client"}
                    </p>
                    {navMode ? (
                      <p className="text-[10px] text-blue-500 mt-1.5 font-bold uppercase tracking-wider bg-blue-50 py-1 px-2 rounded">
                        Click to route here
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                        Click to view profile
                      </p>
                    )}
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>

          <div className="absolute top-6 left-6 z-400 flex flex-col gap-4 w-72 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 transition-all pointer-events-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">
                  Route Planner
                </h3>
                <div
                  className={`w-3 h-3 rounded-full ${navMode ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
                ></div>
              </div>

              {!navMode ? (
                <button
                  onClick={handleStartRouting}
                  className="w-full mt-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path>
                  </svg>
                  Choose Start Location
                </button>
              ) : (
                <div className="space-y-3 mt-2">
                  {isPickingStart ? (
                    <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-indigo-700 text-xs font-bold animate-pulse text-center">
                      📍 Click anywhere on the map to drop your start pin
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                      <p className="text-xs text-green-700 font-bold flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        Start Location Set
                      </p>
                      <button
                        onClick={() => {
                          setIsPickingStart(true);
                          setDestination(null);
                          setRouteSummary(null);
                        }}
                        className="text-[10px] text-blue-600 font-bold uppercase hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {!isPickingStart && !destination && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-700 text-xs font-bold text-center shadow-sm">
                      🎯 Select a client or supplier marker to see the route
                    </div>
                  )}

                  <button
                    onClick={handleDisableNavigation}
                    className="w-full bg-white text-gray-600 text-sm font-semibold py-2 rounded-xl hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    Cancel Navigation
                  </button>
                </div>
              )}
            </div>

            {navMode && routeSummary && destination && (
              <div className="bg-linear-to-br from-indigo-900 to-purple-900 p-5 rounded-2xl shadow-2xl border border-indigo-700 text-white animate-fade-in-up pointer-events-auto">
                <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">
                  Route to
                </p>
                <p className="font-bold text-lg leading-tight mb-4 truncate">
                  {destination.name}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-3 border border-white/5">
                    <svg
                      className="w-5 h-5 text-yellow-400 mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <p className="text-[10px] text-indigo-200 uppercase font-semibold">
                      Driving Time
                    </p>
                    <p className="text-xl font-bold">
                      {routeSummary.time}{" "}
                      <span className="text-sm font-medium">min</span>
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/5">
                    <svg
                      className="w-5 h-5 text-emerald-400 mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      ></path>
                    </svg>
                    <p className="text-[10px] text-indigo-200 uppercase font-semibold">
                      Distance
                    </p>
                    <p className="text-xl font-bold">
                      {routeSummary.distance}{" "}
                      <span className="text-sm font-medium">km</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-6 left-6 z-400 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-gray-100 pointer-events-none">
            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
              Legend
            </h4>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-linear-to-br from-indigo-500 to-purple-600"></div>
              <span className="text-xs font-semibold text-gray-700">
                Clients
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-linear-to-br from-emerald-500 to-teal-600"></div>
              <span className="text-xs font-semibold text-gray-700">
                Suppliers
              </span>
            </div>
          </div>
        </div>
      )}

      {/* RENDER BOTH MODALS */}
      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
      {selectedSupplier && (
        <SupplierDetailsModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </div>
  );
};

export default ClientsMap;
