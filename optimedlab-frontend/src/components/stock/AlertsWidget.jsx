// src/components/stock/AlertsWidget.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import stockService from '../../services/stockService';

const AlertsWidget = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await stockService.getAlerts();
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch alerts', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-24 rounded"></div>;
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-green-800">All stock levels are healthy.</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-red-800 mb-2">Stock Alerts ({alerts.length})</h3>
      <ul className="space-y-2">
        {alerts.slice(0, 5).map(product => (
          <li key={product._id} className="text-sm">
            <span className="font-medium">{product.name}</span> - Stock: {product.stockQuantity} (Threshold: {product.threshold})
          </li>
        ))}
        {alerts.length > 5 && (
          <li className="text-sm text-red-600">
            <Link to="/stock" className="underline">View all {alerts.length} alerts</Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default AlertsWidget;