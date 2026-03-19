// src/components/clients/ClientForm.jsx
// eslint-disable-next-line no-unused-vars
import { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to smoothly center the map when position changes
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

  // Map States - Defaulting to Tunisia/Métlaoui region
  const [mapPosition, setMapPosition] = useState([34.3333, 8.4]);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

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
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      console.error("Error fetching address details:", error);
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
    return mapPosition === null ? null : (
      <Marker position={mapPosition}></Marker>
    );
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
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-5xl shadow-2xl rounded-2xl bg-white flex flex-col max-h-[95vh] animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {client ? "Edit Client Profile" : "New Client Profile"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the information below to register a client.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto custom-scrollbar grow bg-gray-50/50">
          <form
            id="client-form"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT COLUMN: Info & Avatar */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
                    Client Avatar
                  </h3>
                  <div className="flex items-center space-x-6">
                    <div className="shrink-0 relative group cursor-pointer">
                      {imagePreview ? (
                        <img
                          className="h-24 w-24 object-cover rounded-full border-4 border-white shadow-lg"
                          src={imagePreview}
                          alt="Preview"
                        />
                      ) : (
                        <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 border-4 border-white shadow-lg">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <label className="block flex-1">
                      <div className="w-full flex justify-center items-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer">
                        <span className="text-sm font-medium text-indigo-600">
                          Click to browse images
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        PNG, JPG or WEBP up to 5MB
                      </p>
                    </label>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">
                    Personal Details
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${errors.name ? "border-red-400" : "border-gray-200"}`}
                      placeholder="e.g. Jane Doe"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1.5">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${errors.email ? "border-red-400" : "border-gray-200"}`}
                        placeholder="mail@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1.5">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${errors.phone ? "border-red-400" : "border-gray-200"}`}
                        placeholder="+216 XX XXX XXX"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1.5">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
                    Internal Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Add any specific requirements, preferences, or remarks..."
                  ></textarea>
                </div>
              </div>

              {/* RIGHT COLUMN: Map & Address */}
              <div className="space-y-6 flex flex-col">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm grow flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                      Location Setup
                    </h3>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
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
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Locate Me
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    Click anywhere on the map to drop a pin. The address fields
                    will auto-fill based on your selection.
                  </p>

                  {/* Map Container */}
                  <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border-2 border-gray-200 shadow-inner z-0 mb-6 group">
                    {/* Loading Overlay */}
                    {isFetchingAddress && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-1000 flex flex-col items-center justify-center transition-all">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mb-2"></div>
                        <span className="text-sm font-semibold text-indigo-800">
                          Pinpointing Address...
                        </span>
                      </div>
                    )}

                    <MapContainer
                      center={mapPosition}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
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

                  {/* Extracted Address Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Street Name & Number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        State / Province
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="0000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        Country
                      </label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-3 px-8 py-5 border-t border-gray-100 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="client-form"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            {client ? "Update Client" : "Create Client"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
