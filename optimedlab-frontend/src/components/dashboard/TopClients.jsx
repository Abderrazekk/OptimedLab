// src/components/dashboard/TopClients.jsx
import React from "react";

const TopClients = ({ clients = [] }) => {
  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <svg
              className="h-4 w-4"
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
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Top Clients
          </h3>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[0.7rem] font-bold text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
          {clients.length} Active
        </span>
      </div>

      {/* Content */}
      {clients.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-100 bg-gray-50/50 py-12 transition-all duration-300 hover:bg-emerald-50/30">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100/50 text-emerald-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-500">No clients found</p>
          <p className="mt-1 text-xs text-gray-400">Client rankings will appear here.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {clients.map((c, i) => (
            <li
              key={i}
              className="group relative flex items-center justify-between rounded-2xl border border-transparent bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-emerald-200"
            >
              <div className="flex min-w-0 items-center gap-4">
                {/* Rank badge */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${
                    i === 0
                      ? "bg-linear-to-br from-amber-100 to-amber-200 text-amber-700 ring-1 ring-amber-300/50" // Gold
                      : i === 1
                        ? "bg-linear-to-br from-slate-100 to-slate-200 text-slate-700 ring-1 ring-slate-300/50" // Silver
                        : i === 2
                          ? "bg-linear-to-br from-orange-50 to-orange-100 text-orange-700 ring-1 ring-orange-200/50" // Bronze
                          : "bg-gray-50 text-gray-500 ring-1 ring-gray-200" // Others
                  }`}
                >
                  #{i + 1}
                </div>
                <div className="truncate">
                  <p className="truncate text-sm font-bold text-gray-800 transition-colors group-hover:text-emerald-700">
                    {c.name || "Unknown Client"}
                  </p>
                  <p className="text-xs font-medium text-gray-400">
                    {c.invoiceCount ? `${c.invoiceCount} invoices` : "Premium Client"}
                  </p>
                </div>
              </div>
              <div className="ml-4 flex shrink-0 flex-col items-end">
                <span className="text-sm font-bold text-gray-900">
                  {c.totalSpent 
                    ? `${c.totalSpent.toLocaleString("fr-FR", { minimumFractionDigits: 3 })} TND` 
                    : "0.000 TND"}
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-600">
                  Total Spent
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopClients;