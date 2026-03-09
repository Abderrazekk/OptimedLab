// src/components/dashboard/TopProducts.jsx
const TopProducts = ({ products }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-medium text-gray-700 mb-2">Top Selling Products</h3>
      {products.length === 0 ? (
        <p className="text-gray-500 text-sm">No data available</p>
      ) : (
        <ul className="space-y-2">
          {products.map((p, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{p.name}</span>
              <span className="font-medium">{p.quantity} units</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopProducts;