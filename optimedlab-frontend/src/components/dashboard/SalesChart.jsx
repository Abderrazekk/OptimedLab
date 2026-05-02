import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SalesChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-75 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-100 bg-gray-50/50 py-14 transition-all duration-300 hover:bg-emerald-50/30">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100/50 text-emerald-500">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-500">
          No sales data available
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Sales activity will appear here once recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="h-75 w-full rounded-2xl bg-white pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#f3f4f6"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 500 }}
            dy={10}
            minTickGap={20}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 500 }}
            dx={-10}
          />
          <Tooltip
            cursor={{
              stroke: "#10b981",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              padding: "12px 16px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(4px)",
            }}
            labelStyle={{
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "4px",
              fontWeight: 500,
            }}
            itemStyle={{ fontSize: "14px", fontWeight: 700, color: "#047857" }}
            formatter={(value) => [`${value?.toLocaleString()} TND`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#salesGradient)"
            activeDot={{
              r: 6,
              fill: "#10b981",
              stroke: "#ffffff",
              strokeWidth: 3,
              boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
