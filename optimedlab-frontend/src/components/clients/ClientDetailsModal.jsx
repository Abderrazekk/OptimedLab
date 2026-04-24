import React from "react";

const ClientDetailsModal = ({ client, onClose }) => {
  if (!client) return null;

  const hasAddress =
    client.address &&
    (client.address.street || client.address.city || client.address.country);

  return (
    <div
      className="fixed inset-0 z-500 flex items-center justify-center overflow-y-auto bg-emerald-900/45 p-4 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-145 overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(5,150,105,0.08),0_24px_64px_rgba(6,78,59,0.2),0_8px_24px_rgba(0,0,0,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-7 pb-14 pt-7">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-55 w-55 rounded-full border border-white/5"></div>
          <div className="pointer-events-none absolute -bottom-12 left-[30%] h-40 w-40 rounded-full border border-white/3"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"></span>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
                Client Profile
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/80 backdrop-blur transition hover:bg-white/20 hover:text-white"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Avatar + Identity pull-up ── */}
        <div className="relative z-10 mx-7 -mt-9 flex items-end gap-5">
          <div className="shrink-0 rounded-2xl bg-white p-0.5 shadow-lg shadow-emerald-900/20">
            {client.image ? (
              <img
                src={`http://localhost:5000/uploads/clients/${client.image}`}
                alt={client.name}
                className="h-20 w-20 rounded-2xl object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-600 to-emerald-700 text-2xl font-bold text-white text-shadow">
                {client.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <h2 className="truncate text-xl font-bold -tracking-[0.02em] text-gray-900">
              {client.name}
            </h2>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              {client.company || "Independent"}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6">
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Contact */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-600">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 7.5 7.5l1.96-1.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">
                  Contact
                </span>
              </div>

              <div className="flex items-center gap-3 border-b border-gray-100 py-2 first:pt-0 last:border-none last:pb-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <div className="text-[0.7rem] font-medium text-gray-400">Email</div>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-gray-100 py-2 first:pt-0 last:border-none last:pb-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 7.5 7.5l1.96-1.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[0.7rem] font-medium text-gray-400">Phone</div>
                  <a
                    href={`tel:${client.phone}`}
                    className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 hover:underline"
                  >
                    {client.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-600">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">
                  Location
                </span>
              </div>

              <div className="flex items-start gap-3 border-b border-gray-100 py-2 first:pt-0 last:border-none last:pb-0">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="text-[0.7rem] font-medium text-gray-400">
                    Address
                  </div>
                  {hasAddress ? (
                    <div className="text-sm font-medium text-gray-700">
                      {client.address.street && (
                        <div>{client.address.street}</div>
                      )}
                      {(client.address.city ||
                        client.address.state ||
                        client.address.zipCode) && (
                        <div>
                          {[client.address.city, client.address.state, client.address.zipCode]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                      {client.address.country && (
                        <span className="mt-1 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-emerald-600">
                          {client.address.country}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm italic text-gray-400">
                      Not provided
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-amber-100 p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-200/50 text-amber-600">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-amber-800">
                  Internal Notes
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm font-normal leading-relaxed text-amber-900">
                {client.notes}
              </p>
            </div>
          )}
        </div>

        {/* ── Footer CTA ── */}
        <div className="flex flex-col gap-3 px-7 pb-7 sm:flex-row">
          <a
            href={`mailto:${client.email}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 active:translate-y-0.5"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Send Email
          </a>
          <a
            href={`tel:${client.phone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 7.5 7.5l1.96-1.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call
          </a>
          <button
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;