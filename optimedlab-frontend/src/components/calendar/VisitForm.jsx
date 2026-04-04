// src/components/calendar/VisitForm.jsx
import { useState, useEffect } from "react";
import visitService from "../../services/visitService";
import { useAuth } from "../../context/AuthContext";

const VisitForm = ({ isOpen, onClose, onSuccess, initialDate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: "",
    commercial: user._id, // Default to self
    client: "",
    products: [], // Now an array of objects: { product: id, quantity: num }
    notes: "",
    color: "#10b981", // Default Emerald
  });

  const [selectedSupplier, setSelectedSupplier] = useState("");

  const [commercials, setCommercials] = useState([]);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reset form and fetch data when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: "",
        commercial: user._id,
        client: "",
        products: [],
        notes: "",
        color: "#10b981",
      });
      setSelectedSupplier("");
      fetchData();

      if (initialDate) {
        // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
        const dateObj = new Date(initialDate);
        dateObj.setHours(9, 0); // Default to 9:00 AM
        const formattedDate = dateObj.toISOString().slice(0, 16);
        setFormData((prev) => ({ ...prev, date: formattedDate }));
      }
    }
  }, [isOpen, initialDate, user._id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Make ONE call to our specialized endpoint
      const data = await visitService.getFormData();

      setCommercials(data.commercials || []);
      setClients(data.clients || []);
      setSuppliers(data.suppliers || []);
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch form data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up product data before sending (backend only needs product ID and quantity)
      const submitData = {
        ...formData,
        products: formData.products.map((p) => ({
          product: p.product,
          quantity: p.quantity,
        })),
      };

      await visitService.createVisit(submitData);
      onSuccess(); // Refresh calendar
      onClose(); // Close modal
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la création");
    }
  };

  // Filter products based on the selected supplier
  const filteredProducts = selectedSupplier
    ? products.filter(
        (p) =>
          p.supplier?._id === selectedSupplier ||
          p.supplier === selectedSupplier,
      )
    : products;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            Planifier une Visite / Livraison
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Chargement des données...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date et Heure
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Couleur Calendrier
                </label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full h-[42px] rounded cursor-pointer border-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Commercial Assigné
                </label>
                <select
                  name="commercial"
                  required
                  value={formData.commercial}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none"
                >
                  <option value="">-- Sélectionner un commercial --</option>
                  {commercials.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c._id === user._id ? "(Moi)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Client
                </label>
                <select
                  name="client"
                  required
                  value={formData.client}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none"
                >
                  <option value="">-- Sélectionner un client --</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* --- NEW PRODUCTS WITH QUANTITY UI --- */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-700">
                  Produits à Livrer
                </h3>

                {/* Supplier Filter for Products */}
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
                >
                  <option value="">Tous les fournisseurs</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <select
                  value=""
                  onChange={(e) => {
                    const prodId = e.target.value;
                    if (!prodId) return;
                    const prodDetails = products.find((p) => p._id === prodId);
                    // Add if not already in list
                    if (!formData.products.find((p) => p.product === prodId)) {
                      setFormData((prev) => ({
                        ...prev,
                        products: [
                          ...prev.products,
                          {
                            product: prodId,
                            name: prodDetails.name,
                            maxStock: prodDetails.stockQuantity,
                            quantity: 1,
                          },
                        ],
                      }));
                    }
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">
                    + Ajouter un produit à la livraison...
                  </option>
                  {filteredProducts.map((p) => (
                    <option
                      key={p._id}
                      value={p._id}
                      disabled={p.stockQuantity <= 0}
                    >
                      {p.name} (En Stock: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* List of selected products with quantity inputs */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {formData.products.map((item, index) => (
                  <div
                    key={item.product}
                    className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-lg shadow-sm"
                  >
                    <span className="text-sm font-medium text-slate-700 truncate flex-1 pr-2">
                      {item.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max={item.maxStock}
                        value={item.quantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value) || 1;
                          const newProducts = [...formData.products];
                          newProducts[index].quantity =
                            newQty > item.maxStock ? item.maxStock : newQty;
                          setFormData((prev) => ({
                            ...prev,
                            products: newProducts,
                          }));
                        }}
                        className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-md text-center focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-xs text-slate-400 w-8">
                        / {item.maxStock}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            products: prev.products.filter(
                              (p) => p.product !== item.product,
                            ),
                          }));
                        }}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {formData.products.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Aucun produit sélectionné
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes / Instructions
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Planifier et Déduire du Stock
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VisitForm;
