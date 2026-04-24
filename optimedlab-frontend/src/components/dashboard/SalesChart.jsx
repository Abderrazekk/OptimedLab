// src/components/dashboard/SalesChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const SalesChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 rounded-xl border-2 border-dashed border-emerald-100 bg-gray-50/50">
        <svg className="h-8 w-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <p className="text-sm text-gray-500 font-medium">No sales data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-75 bg-white rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }}
            width={60}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              padding: '8px 12px'
            }}
            labelStyle={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}
            itemStyle={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}
            formatter={(value) => [`${value?.toLocaleString()} TND`, 'Sales']}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#059669" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
            fill="url(#salesGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;