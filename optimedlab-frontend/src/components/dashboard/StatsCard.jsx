// src/components/dashboard/StatsCard.jsx
const TYPE_CONFIG = {
  revenue: {
    color: "emerald",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  sales: {
    color: "blue",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
    ),
  },
  products: {
    color: "purple",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  clients: {
    color: "amber",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
};

const COLOR_CLASSES = {
  emerald: "bg-emerald-100 text-emerald-600",
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  amber: "bg-amber-100 text-amber-600",
};

const StatsCard = ({ title, value, icon, type, color }) => {
  // If a custom icon is passed, use it; otherwise use type config
  let displayIcon = icon;
  let colorClass = COLOR_CLASSES[color] || COLOR_CLASSES.emerald;

  if (type && TYPE_CONFIG[type]) {
    displayIcon = TYPE_CONFIG[type].icon;
    colorClass = COLOR_CLASSES[TYPE_CONFIG[type].color] || colorClass;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-gray-50 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
            {value}
          </p>
        </div>
        <div
          className={`h-11 w-11 flex items-center justify-center rounded-xl ${colorClass} shadow-sm`}
        >
          {displayIcon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
