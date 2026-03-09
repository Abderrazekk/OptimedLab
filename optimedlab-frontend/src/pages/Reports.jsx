/* eslint-disable no-unused-vars */
// src/pages/Reports.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import biService from '../services/biService';

const Reports = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'sales',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const blob = await biService.generateReport(formData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${formData.type}-${Date.now()}.pdf`;
      a.click();
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Generate Reports</h1>
      <p className="mt-2 text-sm text-gray-700">Create PDF reports for analysis</p>

      <div className="mt-8 max-w-md">
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="sales">Sales Report</option>
              <option value="products">Product Performance</option>
              <option value="stock">Stock Alert Report</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate PDF Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reports;