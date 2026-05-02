import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import stockService from "../../services/stockService";

const StockMovementChart = () => {
  const [period, setPeriod] = useState("week");
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

      if (period === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setDate(startDate.getDate() - 30); // Use exactly 30 days for better alignment
      }

      const response = await stockService.getMovements({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      // 1. FIX: Safely extract the array regardless of how the backend wraps the JSON response
      let movements = [];
      if (Array.isArray(response)) {
        movements = response;
      } else if (response?.data && Array.isArray(response.data)) {
        movements = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        movements = response.data.data;
      } else if (response?.movements && Array.isArray(response.movements)) {
        movements = response.movements;
      }

      const grouped = {};

      movements.forEach((m) => {
        if (!m.createdAt) return; // Skip if no date

        const date = new Date(m.createdAt);
        let key;

        if (period === "week") {
          key = date.toLocaleDateString("en-US", { weekday: "short" });
        } else {
          key = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }

        if (!grouped[key]) {
          grouped[key] = { name: key, In: 0, Out: 0 };
        }

        // 2. FIX: Make the Type check case-insensitive and support both English & French
        const moveType = String(m.type || m.movementType || "").toUpperCase();
        const quantity = Number(m.quantity) || 0;

        if (moveType === "IN" || moveType.includes("ENTR")) {
          grouped[key].In += quantity;
        } else if (moveType === "OUT" || moveType.includes("SORT")) {
          grouped[key].Out += quantity;
        }
      });

      // 3. FIX: Ensure perfect chronological order for both Week and Month views
      let chartData = [];

      if (period === "week") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = days[d.getDay()];
          chartData.push(grouped[key] || { name: key, In: 0, Out: 0 });
        }
      } else {
        // Generate the last 30 days chronologically
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          chartData.push(grouped[key] || { name: key, In: 0, Out: 0 });
        }
      }

      setData(chartData);
    } catch (error) {
      console.error("Failed to fetch movement data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header & Controls */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
          Movement Activity
        </h3>
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50/50 p-1">
          <button
            onClick={() => setPeriod("week")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              period === "week"
                ? "bg-white text-emerald-700 shadow-sm ring-1 ring-gray-900/5"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              period === "month"
                ? "bg-white text-emerald-700 shadow-sm ring-1 ring-gray-900/5"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Chart Area */}
      {loading ? (
        <div className="flex h-75 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500"></div>
        </div>
      ) : data.length === 0 || data.every((d) => d.In === 0 && d.Out === 0) ? (
        <div className="flex h-75 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-100 bg-gray-50/50 transition-all duration-300 hover:bg-emerald-50/30">
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
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-500">
            No movements recorded
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Adjust the date range to see historical data.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 500 }}
              dx={-10}
            />
            <Tooltip
              cursor={{ fill: "#f9fafb" }}
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
                marginBottom: "6px",
                fontWeight: 600,
              }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{
                fontSize: "12px",
                fontWeight: 500,
                paddingTop: "10px",
              }}
            />
            <Bar
              dataKey="In"
              name="Stock In"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="Out"
              name="Stock Out"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default StockMovementChart;
