// src/components/suppliers/SupplierDetailsModal.jsx
import React from 'react';

const SupplierDetailsModal = ({ supplier, onClose }) => {
  if (!supplier) return null;

  // Fallback color if none is set
  const brandColor = supplier.bgColor || '#10b981'; // Default to emerald

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up my-8">
        
        {/* Header Background using Supplier's Brand Color */}
        <div 
          className="h-32 w-full relative" 
          style={{ backgroundColor: brandColor }}
        >
          {/* Soft overlay gradient for texture */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/20"></div>
        </div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-8 pb-8 relative">
          {/* Avatar / Logo */}
          <div className="flex justify-center -mt-16 mb-6">
            <div className="p-1.5 bg-white rounded-2xl shadow-lg relative group">
              {supplier.image ? (
                <img 
                  src={`http://localhost:5000${supplier.image}`} 
                  alt={supplier.name} 
                  className="w-28 h-28 object-cover rounded-xl border border-gray-100"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/112?text=NA'; }}
                />
              ) : (
                <div 
                  className="w-28 h-28 rounded-xl flex items-center justify-center text-4xl font-bold border border-gray-100 text-white shadow-inner"
                  style={{ backgroundColor: brandColor }}
                >
                  {supplier.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Core Info */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{supplier.name}</h2>
            {supplier.contactPerson && (
              <p className="text-sm font-semibold text-gray-500 mt-1.5 uppercase tracking-wider">
                Contact: <span className="text-gray-700">{supplier.contactPerson}</span>
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Contact Section */}
            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-blue-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <a href={`mailto:${supplier.email}`} className="text-sm font-medium hover:text-blue-600 transition-colors truncate">{supplier.email}</a>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mr-3 text-emerald-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <a href={`tel:${supplier.phone}`} className="text-sm font-medium hover:text-emerald-600 transition-colors truncate">{supplier.phone}</a>
                </div>
                {supplier.website && (
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3 text-purple-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                    <a href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-purple-600 transition-colors truncate">
                      {supplier.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Location Details</h3>
              <div className="flex items-start text-gray-700">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3 text-red-500 shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="text-sm font-medium">
                  {supplier.address && (supplier.address.street || supplier.address.city || supplier.address.country) ? (
                    <div className="space-y-1 text-gray-600">
                      <p className="text-gray-900">{supplier.address.street}</p>
                      <p>{supplier.address.city}{supplier.address.state ? `, ${supplier.address.state}` : ''} {supplier.address.zipCode}</p>
                      <p className="font-bold text-gray-800 uppercase tracking-wide mt-1">{supplier.address.country}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No address provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {supplier.notes && (
              <div className="col-span-1 md:col-span-2 bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100 shadow-sm">
                <h3 className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Internal Remarks
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap font-medium leading-relaxed">
                  {supplier.notes}
                </p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailsModal;