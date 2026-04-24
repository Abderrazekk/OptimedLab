import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/* -----------------------------------------------------------
   Tailwind requires custom keyframes for the rise animation.
   Add this to your tailwind.config.js theme.extend:
   keyframes: { rise: { '0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } } },
   animation: { rise: 'rise 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both' }
   Then use className="animate-rise" below.
   -----------------------------------------------------------
   For this code we apply the animation via the `animate-rise` class
   (see className on the panel). Please ensure the configuration exists
   or replace with a simple `[animation:rise_0.3s…]` arbitrary value.
   ----------------------------------------------------------- */

const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 1.5 });
  }, [lat, lng, map]);
  return null;
};

const ClientForm = ({ client, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: { street: "", city: "", state: "", zipCode: "", country: "" },
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mapPosition, setMapPosition] = useState([34.3333, 8.4]);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        company: client.company || "",
        address: client.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        notes: client.notes || "",
      });
      if (client.image) {
        setImagePreview(
          `http://localhost:5000/uploads/clients/${client.image}`,
        );
      }
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const fetchAddressFromCoords = async (lat, lng) => {
    setIsFetchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();
      if (data && data.address) {
        setFormData((prev) => ({
          ...prev,
          address: {
            street: data.address.road || data.address.pedestrian || "",
            city:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "",
            state: data.address.state || data.address.county || "",
            zipCode: data.address.postcode || "",
            country: data.address.country || "",
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    } finally {
      setIsFetchingAddress(false);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setMapPosition([lat, lng]);
        fetchAddressFromCoords(lat, lng);
      },
    });
    return mapPosition === null ? null : <Marker position={mapPosition} />;
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsFetchingAddress(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapPosition([latitude, longitude]);
        fetchAddressFromCoords(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Unable to retrieve your location.");
        setIsFetchingAddress(false);
      },
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!formData.phone) newErrors.phone = "Phone number is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("phone", formData.phone);
    submitData.append("company", formData.company);
    submitData.append("notes", formData.notes);
    submitData.append("address.street", formData.address.street);
    submitData.append("address.city", formData.address.city);
    submitData.append("address.state", formData.address.state);
    submitData.append("address.zipCode", formData.address.zipCode);
    submitData.append("address.country", formData.address.country);
    if (imageFile) submitData.append("image", imageFile);
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-emerald-900/50 p-6 backdrop-blur-[6px]">
      <div className="relative flex w-full max-w-240 animate-rise flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(5,150,105,0.08),0_32px_80px_rgba(6,78,59,0.22),0_8px_24px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-7 py-6">
          {/* decorative circle */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-45 w-45 rounded-full border border-white/5"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"></span>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-300">
                  {client ? "Edit Record" : "New Record"}
                </span>
              </div>
              <h2 className="text-xl font-bold -tracking-[0.02em] text-white">
                {client ? "Edit Client Profile" : "Add New Client"}
              </h2>
              <p className="mt-0.5 text-sm text-white/50">
                {client
                  ? "Update the details below and save your changes."
                  : "Fill in the information to register a new client."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/80 backdrop-blur transition hover:bg-white/20 hover:text-white"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/80 p-7">
          <form
            id="client-form"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Left column */}
              <div>
                {/* Avatar */}
                <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Client Avatar
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-emerald-50 bg-linear-to-br from-emerald-50 to-emerald-100 shadow-md shadow-emerald-500/10">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#059669"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>
                    <label
                      className={`flex-1 cursor-pointer rounded-xl border-2 border-dashed px-4 py-3 text-center transition ${
                        isDraggingOver
                          ? "border-emerald-600 bg-emerald-100"
                          : "border-emerald-200 bg-emerald-50 hover:border-emerald-600 hover:bg-emerald-100"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(true);
                      }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="text-sm font-semibold text-emerald-600">
                        {imagePreview ? "Replace photo" : "Upload photo"}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Drag & drop or click · PNG, JPG, WEBP up to 5MB
                      </div>
                    </label>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Personal Details
                    </span>
                  </div>

                  {/* Name */}
                  <div className="mb-3">
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.06em] text-gray-500">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition ${
                        errors.name
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          : "border-gray-200 bg-gray-50 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      }`}
                      placeholder="e.g. Jane Doe"
                    />
                    {errors.name && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {errors.name}
                      </div>
                    )}
                  </div>

                  {/* Email + Phone */}
                  <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.06em] text-gray-500">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition ${
                          errors.email
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-200 bg-gray-50 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        }`}
                        placeholder="mail@example.com"
                      />
                      {errors.email && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          {errors.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.06em] text-gray-500">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition ${
                          errors.phone
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-200 bg-gray-50 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        }`}
                        placeholder="+216 XX XXX XXX"
                      />
                      {errors.phone && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.06em] text-gray-500">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      placeholder="Company name (optional)"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Internal Notes
                    </span>
                  </div>
                  <textarea
                    name="notes"
                    rows="4"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm leading-relaxed outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="Add requirements, preferences, or private remarks…"
                  />
                </div>
              </div>

              {/* Right column - Map & Address */}
              <div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Location Setup
                    </span>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <p className="mr-2 flex-1 text-sm text-gray-400">
                      Click the map to pin a location — address fields
                      auto-fill.
                    </p>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100 hover:border-emerald-600"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
                      </svg>
                      Locate Me
                    </button>
                  </div>

                  {/* Map */}
                  <div className="relative mb-4 h-56 overflow-hidden rounded-xl border border-gray-200">
                    {isFetchingAddress && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-sm">
                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-emerald-100 border-t-emerald-600"></div>
                        <span className="text-sm font-semibold text-emerald-900">
                          Pinpointing address…
                        </span>
                      </div>
                    )}
                    <MapContainer
                      center={mapPosition}
                      zoom={13}
                      className="h-full w-full"
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      />
                      <LocationMarker />
                      <RecenterAutomatically
                        lat={mapPosition[0]}
                        lng={mapPosition[1]}
                      />
                    </MapContainer>
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="col-span-full">
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.06em] text-gray-500">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        placeholder="Street name & number"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.06em] text-gray-500">
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.06em] text-gray-500">
                        State / Province
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.06em] text-gray-500">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        placeholder="00000"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.06em] text-gray-500">
                        Country
                      </label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-white px-7 py-4">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Fields marked <span className="mx-0.5 text-red-500">*</span> are
            required
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="client-form"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:translate-y-0.5"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {client ? "Save Changes" : "Create Client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
