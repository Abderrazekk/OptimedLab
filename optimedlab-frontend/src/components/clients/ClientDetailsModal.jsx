import React from 'react';

const ClientDetailsModal = ({ client, onClose }) => {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header Background */}
        <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-700"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors bg-black bg-opacity-20 rounded-full p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-8 pb-8">
          {/* Avatar / Profile Picture */}
          <div className="relative flex justify-center -mt-16 mb-6">
            <div className="p-1.5 bg-white rounded-full">
              {client.image ? (
                <img 
                  src={`http://localhost:5000/uploads/clients/${client.image}`} 
                  alt={client.name} 
                  className="w-28 h-28 object-cover rounded-full shadow-md border border-gray-100"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/112?text=NA'; }}
                />
              ) : (
                <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-4xl font-bold shadow-md border border-blue-200">
                  {client.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Core Info */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{client.name}</h2>
            <p className="text-lg text-gray-500 font-medium mt-1">{client.company || 'Independent Client'}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Contact Section */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a href={`mailto:${client.email}`} className="hover:text-blue-600 transition-colors">{client.email}</a>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <a href={`tel:${client.phone}`} className="hover:text-green-600 transition-colors">{client.phone}</a>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Address details</h3>
              <div className="flex items-start text-gray-700">
                <svg className="w-5 h-5 mr-3 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <div>
                  {client.address && (client.address.street || client.address.city || client.address.country) ? (
                    <>
                      <p>{client.address.street}</p>
                      <p>{client.address.city}, {client.address.state} {client.address.zipCode}</p>
                      <p className="font-medium mt-1">{client.address.country}</p>
                    </>
                  ) : (
                    <p className="text-gray-400 italic">No address provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="col-span-1 md:col-span-2 bg-yellow-50 p-5 rounded-xl border border-yellow-100">
              <h3 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Notes & Remarks
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {client.notes || <span className="text-yellow-600/60 italic">No additional notes for this client.</span>}
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;