import React from "react";

const SupplierDetailsModal = ({ supplier, onClose }) => {
  if (!supplier) return null;

  const hasAddress =
    supplier.address &&
    (supplier.address.street ||
      supplier.address.city ||
      supplier.address.country);

  const avatarGradients = [
    "from-emerald-400 to-green-600",
    "from-green-400 to-teal-600",
    "from-teal-400 to-emerald-600",
    "from-green-500 to-emerald-700",
    "from-emerald-300 to-green-500",
  ];
  const avatarGradient =
    avatarGradients[supplier.name.charCodeAt(0) % avatarGradients.length];

  return (
    <div
      className="fixed inset-0 z-500 flex items-center justify-center overflow-y-auto bg-emerald-900/45 p-4 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-145 overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(5,150,105,0.08),0_24px_64px_rgba(6,78,59,0.2),0_8px_24px_rgba(0,0,0,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-7 pb-14 pt-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-55 w-55 rounded-full border border-white/5"></div>
          <div className="pointer-events-none absolute -bottom-12 left-[30%] h-40 w-40 rounded-full border border-white/3"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"></span>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
                Supplier Profile
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

        {/* Avatar + identity pull-up */}
        <div className="relative z-10 mx-7 -mt-9 flex items-end gap-5">
          <div className="shrink-0 rounded-2xl bg-white p-0.5 shadow-lg shadow-emerald-900/20">
            {supplier.image ? (
              <img
                src={`http://localhost:5000${supplier.image}`}
                alt={supplier.name}
                className="h-20 w-20 rounded-2xl object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br ${avatarGradient} text-2xl font-bold text-white`}
              >
                {supplier.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <h2 className="truncate text-xl font-bold -tracking-[0.02em] text-gray-900">
              {supplier.name}
            </h2>
            {supplier.contactPerson && (
              <p className="text-sm text-gray-500 mt-0.5">
                Contact: {supplier.contactPerson}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Contact Card */}
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

              <div className="space-y-2">
                {/* Email */}
                <div className="flex items-center gap-3">
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
                  <div className="min-w-0">
                    <div className="text-[0.7rem] font-medium text-gray-400">
                      Email
                    </div>
                    <a
                      href={`mailto:${supplier.email}`}
                      className="text-sm font-semibold text-emerald-600 truncate hover:text-emerald-700 hover:underline"
                    >
                      {supplier.email}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
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
                  <div className="min-w-0">
                    <div className="text-[0.7rem] font-medium text-gray-400">
                      Phone
                    </div>
                    <a
                      href={`tel:${supplier.phone}`}
                      className="text-sm font-semibold text-emerald-600 truncate hover:text-emerald-700 hover:underline"
                    >
                      {supplier.phone}
                    </a>
                  </div>
                </div>

                {/* Website (if exists) */}
                {supplier.website && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[0.7rem] font-medium text-gray-400">
                        Website
                      </div>
                      <a
                        href={
                          supplier.website.startsWith("http")
                            ? supplier.website
                            : `https://${supplier.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-indigo-600 truncate hover:text-indigo-700 hover:underline"
                      >
                        {supplier.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Card */}
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

              <div className="flex items-start gap-3">
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
                      {supplier.address.street && (
                        <div>{supplier.address.street}</div>
                      )}
                      {(supplier.address.city ||
                        supplier.address.state ||
                        supplier.address.zipCode) && (
                        <div>
                          {[
                            supplier.address.city,
                            supplier.address.state,
                            supplier.address.zipCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                      {supplier.address.country && (
                        <span className="mt-1 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-emerald-600">
                          {supplier.address.country}
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
          {supplier.notes && (
            <div className="rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-amber-100 p-4">
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
                {supplier.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-7 pb-7 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailsModal;
