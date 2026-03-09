// src/pages/Clients.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import clientService from '../services/clientService';
import ClientForm from '../components/clients/ClientForm';

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Check user role for permissions
  const canAddEdit = user && (user.role === 'admin' || user.role === 'commercial');
  const canDelete = user && user.role === 'admin';
  const canView = user && (user.role === 'admin' || user.role === 'commercial' || user.role === 'director');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    // Filter clients based on search term
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients();
      setClients(response.data);
      setFilteredClients(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedClient(null);
    setShowForm(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete client ${name}?`)) return;
    try {
      await clientService.deleteClient(id);
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete client');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedClient) {
        await clientService.updateClient(selectedClient._id, formData);
      } else {
        await clientService.createClient(formData);
      }
      setShowForm(false);
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  if (!canView) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your client database
          </p>
        </div>
        {canAddEdit && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add New Client
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search clients by name, email or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Company</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created By</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredClients.map((client) => (
                      <tr key={client._id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{client.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.phone}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.company || '-'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {client.createdBy?.name || 'Unknown'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {canAddEdit && (
                            <button
                              onClick={() => handleEdit(client)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(client._id, client.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredClients.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-3 py-8 text-center text-gray-500">
                          No clients found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <ClientForm
          client={selectedClient}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Clients;