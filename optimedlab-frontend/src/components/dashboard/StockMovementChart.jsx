// src/components/dashboard/StockMovementChart.jsx
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import stockService from '../../services/stockService';

const StockMovementChart = () => {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovementData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchMovementData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setMonth(startDate.getMonth() - 12);
      }
      
      const response = await stockService.getMovements({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      const movements = response.data;
      
      // Group by ISO date (for week) or ISO month (for month)
      const grouped = {};
      
      movements.forEach(m => {
        const date = new Date(m.createdAt);
        let key;
        
        if (period === 'week') {
          // Use YYYY-MM-DD as key for week
          key = date.toISOString().split('T')[0];
        } else {
          // Use YYYY-MM as key for month
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        
        if (!grouped[key]) {
          grouped[key] = { 
            key,
            in: 0, 
            out: 0 
          };
        }
        
        if (m.type === 'in') {
          grouped[key].in += m.quantity;
        } else {
          grouped[key].out += m.quantity;
        }
      });
      
      // Convert to array and sort
      let chartData = Object.values(grouped).sort((a, b) => a.key.localeCompare(b.key));
      
      // Format display names
      chartData = chartData.map(item => {
        let displayName;
        if (period === 'week') {
          // Format as "Mon 15/04"
          const date = new Date(item.key + 'T12:00:00'); // Use noon to avoid timezone issues
          displayName = date.toLocaleDateString('fr-FR', { 
            weekday: 'short', 
            day: '2-digit', 
            month: '2-digit' 
          });
        } else {
          // Format as "January 2024"
          const [year, month] = item.key.split('-');
          const date = new Date(year, month - 1, 1);
          displayName = date.toLocaleDateString('fr-FR', { 
            month: 'long', 
            year: 'numeric' 
          });
        }
        return {
          name: displayName,
          in: item.in,
          out: item.out
        };
      });
      
      setData(chartData);
    } catch (error) {
      console.error('Failed to fetch movement data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Stock Movements</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 text-sm rounded-md transition ${
              period === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 text-sm rounded-md transition ${
              period === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No movement data available for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="in" fill="#10b981" name="In" />
            <Bar dataKey="out" fill="#ef4444" name="Out" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default StockMovementChart;