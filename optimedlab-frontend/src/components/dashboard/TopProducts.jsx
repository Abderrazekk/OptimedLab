// src/components/dashboard/TopProducts.jsx
const TopProducts = ({ products }) => {
  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Top Selling Products
        </h3>
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.65rem] font-bold text-emerald-700">
          {products.length} products
        </span>
      </div>

      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No data available
        </p>
      ) : (
        <ul className="space-y-2">
          {products.map((p, i) => (
            <li
              key={i}
              className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 transition hover:border-emerald-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank badge */}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    i === 0
                      ? "bg-amber-100 text-amber-700"
                      : i === 1
                        ? "bg-gray-200 text-gray-600"
                        : i === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="truncate">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-400">Product</p>
                </div>
              </div>
              <span className="ml-3 shrink-0 text-sm font-bold text-emerald-700">
                {p.quantity} units
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopProducts;