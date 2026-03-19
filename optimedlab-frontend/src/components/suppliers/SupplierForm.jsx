// src/components/suppliers/SupplierForm.jsx
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

const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 1.5 });
  }, [lat, lng, map]);
  return null;
};

const SupplierForm = ({ supplier, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    notes: "",
    bgColor: "#ffffff",
    address: { street: "", city: "", state: "", zipCode: "", country: "" },
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [mapPosition, setMapPosition] = useState([34.3333, 8.4]); // Tunisia Default
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        contactPerson: supplier.contactPerson || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        website: supplier.website || "",
        notes: supplier.notes || "",
        bgColor: supplier.bgColor || "#ffffff",
        address: supplier.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
      });
      if (supplier.image)
        setImagePreview(`http://localhost:5000${supplier.image}`);
    }
  }, [supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
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
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingAddress(false);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click: (e) => {
        setMapPosition([e.latlng.lat, e.latlng.lng]);
        fetchAddressFromCoords(e.latlng.lat, e.latlng.lng);
      },
    });
    return <Marker position={mapPosition}></Marker>;
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    setIsFetchingAddress(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapPosition([pos.coords.latitude, pos.coords.longitude]);
        fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        alert("Unable to retrieve location.");
        setIsFetchingAddress(false);
      },
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("contactPerson", formData.contactPerson);
    submitData.append("email", formData.email);
    submitData.append("phone", formData.phone);
    submitData.append("website", formData.website);
    submitData.append("notes", formData.notes);
    submitData.append("bgColor", formData.bgColor);

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
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {supplier ? "Edit Supplier" : "New Supplier"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the information below to register a supplier.
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

        <div className="overflow-y-auto custom-scrollbar flex-grow bg-gray-50/50">
          <form id="supplier-form" onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                {/* Image Upload & Brand Color */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-6 flex-1">
                    <div className="shrink-0 relative group cursor-pointer">
                      {imagePreview ? (
                        <img
                          className="h-20 w-20 object-cover rounded-xl border shadow-sm"
                          src={imagePreview}
                          alt="Preview"
                        />
                      ) : (
                        <div className="h-20 w-20 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm">
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
                    <label className="block cursor-pointer flex-1">
                      <div className="w-full flex justify-center py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors">
                        <span className="text-xs font-medium text-emerald-600">
                          Browse Image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </label>
                  </div>
                  <div className="ml-6 border-l pl-6">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                      Brand Color
                    </label>
                    <input
                      type="color"
                      name="bgColor"
                      value={formData.bgColor}
                      onChange={handleChange}
                      className="h-10 w-14 cursor-pointer rounded-lg border-gray-200"
                    />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                      Supplier Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${errors.name ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none ${errors.email ? "border-red-400" : "border-gray-200"}`}
                      />
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
                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none ${errors.phone ? "border-red-400" : "border-gray-200"}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Map & Address */}
              <div className="space-y-6 flex flex-col">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex-grow flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                      Location Setup
                    </h3>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
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

                  <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border-2 border-gray-200 shadow-inner z-0 mb-6">
                    {isFetchingAddress && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600 mb-2"></div>
                      </div>
                    )}
                    <MapContainer
                      center={mapPosition}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                      <LocationMarker />
                      <RecenterAutomatically
                        lat={mapPosition[0]}
                        lng={mapPosition[1]}
                      />
                    </MapContainer>
                  </div>

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
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end items-center gap-3 px-8 py-5 border-t border-gray-100 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="supplier-form"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md transition-all"
          >
            {supplier ? "Update Supplier" : "Create Supplier"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierForm;
