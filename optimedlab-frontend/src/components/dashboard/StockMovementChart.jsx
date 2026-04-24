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
        startDate.setMonth(startDate.getMonth() - 12);
      }

      const response = await stockService.getMovements({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      const movements = response.data;

      const grouped = {};
      movements.forEach((m) => {
        const date = new Date(m.createdAt);
        let key;

        if (period === "week") {
          key = date.toISOString().split("T")[0];
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }

        if (!grouped[key]) {
          grouped[key] = { key, in: 0, out: 0 };
        }

        if (m.type === "in") {
          grouped[key].in += m.quantity;
        } else {
          grouped[key].out += m.quantity;
        }
      });

      let chartData = Object.values(grouped).sort((a, b) =>
        a.key.localeCompare(b.key),
      );

      chartData = chartData.map((item) => {
        let displayName;
        if (period === "week") {
          const date = new Date(item.key + "T12:00:00");
          displayName = date.toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
          });
        } else {
          const [year, month] = item.key.split("-");
          const date = new Date(year, month - 1, 1);
          displayName = date.toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          });
        }
        return {
          name: displayName,
          in: item.in,
          out: item.out,
        };
      });

      setData(chartData);
    } catch (error) {
      console.error("Failed to fetch movement data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="h-75 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
            <span className="text-sm text-gray-400">Loading chart data…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Stock Movements
        </h3>

        {/* Period Toggle */}
        <div className="flex rounded-xl border border-gray-200 bg-white p-0.5 w-fit">
          <button
            onClick={() => setPeriod("week")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              period === "week"
                ? "bg-emerald-900 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              period === "month"
                ? "bg-emerald-900 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Content */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-100 bg-gray-50/50 py-12">
          <svg
            className="h-10 w-10 text-gray-300 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm text-gray-500 font-medium">
            No movement data available for this period
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Try selecting a different date range
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="circle" />
            <Bar dataKey="in" fill="#10b981" name="In" radius={[4, 4, 0, 0]} />
            <Bar
              dataKey="out"
              fill="#ef4444"
              name="Out"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default StockMovementChart;
