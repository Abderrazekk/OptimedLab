
const TopClients = ({ clients }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-medium text-gray-700 mb-2">Top Clients</h3>
      {clients.length === 0 ? (
        <p className="text-gray-500 text-sm">No data available</p>
      ) : (
        <ul className="space-y-2">
          {clients.map((c, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{c.name}</span>
              <span className="font-medium">{c.totalSpent?.toFixed(3)} TND</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopClients;