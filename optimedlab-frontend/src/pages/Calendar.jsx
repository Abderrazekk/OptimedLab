/* eslint-disable react-hooks/immutability */
import { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuth } from "../context/AuthContext";
import visitService from "../services/visitService";
import VisitForm from "../components/calendar/VisitForm";

const Calendar = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedVisitDetails, setSelectedVisitDetails] = useState(null);
  const [editingVisit, setEditingVisit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const isSuperCommercial =
    user?.role === "commercial" && user?.isSuperCommercial === true;

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const data = await visitService.getVisits();
      setVisits(data);
    } catch (error) {
      console.error("Failed to load visits", error);
    }
  };

  const events = useMemo(
    () =>
      visits.map((visit) => {
        const names =
          visit.commercials?.length > 0
            ? visit.commercials.map((c) => c.name).join(", ")
            : "Non assigné";
        return {
          id: visit._id,
          title: visit.client?.name || "Client inconnu",
          extendedProps: {
            ...visit,
            commercialNames: names,
            commercialsList: visit.commercials || [],
          },
          start: visit.date,
          backgroundColor: visit.color || "#10b981",
          borderColor: "transparent",
        };
      }),
    [visits],
  );

  const handleDateClick = (arg) => {
    if (isSuperCommercial) {
      setSelectedDate(arg.date);
      setIsFormOpen(true);
    }
  };

  const handleEventClick = (clickInfo) => {
    setSelectedVisitDetails(clickInfo.event.extendedProps);
  };

  const openFormForToday = () => {
    setSelectedDate(new Date());
    setIsFormOpen(true);
  };

  const renderEventContent = (eventInfo) => {
    const { title, extendedProps } = eventInfo.event;
    return (
      <>
        <style>{`
          .cal-event::before {
            content: '';
            position: absolute;
            left: 0; top: 0; bottom: 0;
            width: 3px;
            background: #34d399;
            border-radius: 6px 0 0 6px;
          }
          .cal-event:hover {
            box-shadow: 0 0 0 1.5px #34d399;
          }
        `}</style>
        <div className="cal-event relative flex flex-col gap-0.5 pl-3 pr-2 py-1.5 w-full overflow-hidden rounded-md bg-[#064e3b] hover:bg-[#065f46] transition-colors duration-150 cursor-pointer">
          <span className="text-[11.5px] font-semibold text-emerald-50 truncate leading-snug tracking-tight">
            {title}
          </span>
          {extendedProps.commercialNames && (
            <div className="flex items-center gap-1">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="2.5"
                className="shrink-0"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="text-[10px] font-medium text-emerald-300 truncate">
                {extendedProps.commercialNames}
              </span>
            </div>
          )}
        </div>
      </>
    );
  };

  // Stats with useMemo for performance
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    return {
      total: visits.length,
      thisMonth: visits.filter((v) => new Date(v.date) >= thisMonthStart)
        .length,
      upcoming: visits.filter(
        (v) => new Date(v.date) >= now && new Date(v.date) <= nextWeek,
      ).length,
      uniqueClients: new Set(visits.map((v) => v.client?._id).filter(Boolean))
        .size,
    };
  }, [visits]);

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-8 pb-16 pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.15)_0%,transparent_60%)]"></div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(5,150,105,0.2)_0%,transparent_50%)]"></div>
        <div className="absolute -right-15 -top-15 h-75 w-75 rounded-full border border-white/5"></div>

        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"></span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-emerald-300">
              Visit Scheduling
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold -tracking-[0.02em] text-white">
                Agenda des Visites
              </h1>
              <p className="mt-1 text-sm text-white/50">
                Planification globale des livraisons et visites de l'équipe
                commerciale.
              </p>
            </div>
            {isSuperCommercial && (
              <button
                onClick={openFormForToday}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:translate-y-0.5"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nouvelle Visite
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-8">
        <div className="relative z-10 -mt-6 flex overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-200/70">
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Total Visits
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {stats.total}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              This Month
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {stats.thisMonth}
            </div>
          </div>
          <div className="flex-1 border-r border-gray-100 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Upcoming (7d)
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {stats.upcoming}
            </div>
          </div>
          <div className="flex-1 px-6 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Clients
            </div>
            <div className="text-2xl font-bold -tracking-[0.03em] text-emerald-900">
              {stats.uniqueClients}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-10 pt-6">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="[&_.fc-toolbar-title]:text-xl sm:[&_.fc-toolbar-title]:text-2xl [&_.fc-toolbar-title]:font-extrabold [&_.fc-toolbar-title]:text-gray-800 [&_.fc-button-primary]:rounded-xl [&_.fc-button-primary]:border-gray-200 [&_.fc-button-primary]:bg-white [&_.fc-button-primary]:font-semibold [&_.fc-button-primary]:text-gray-600 [&_.fc-button-primary]:shadow-sm [&_.fc-button-primary:hover]:bg-gray-50 [&_.fc-button-primary]:uppercase [&_.fc-button-primary]:text-xs [&_.fc-button-primary]:py-2 [&_.fc-button-primary]:px-4 [&_.fc-col-header-cell-cushion]:font-semibold [&_.fc-col-header-cell-cushion]:text-gray-500 [&_.fc-daygrid-day-number]:font-semibold [&_.fc-daygrid-day.fc-day-today]:bg-emerald-50/50 [&_.fc-event]:rounded-lg [&_.fc-event]:shadow-sm [&_.fc-event]:overflow-hidden [&_.fc-event]:cursor-pointer [&_.fc-event]:mx-1 [&_.fc-daygrid-event-dot]:hidden">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              height="auto"
              buttonText={{
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
              }}
              locale="fr"
              dayMaxEvents={3}
            />
          </div>
        </div>
      </div>

      {/* Visit creation form (unchanged) */}
      <VisitForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchVisits}
        initialDate={selectedDate}
      />

      {/* Visit edit form */}
      <VisitForm
        isOpen={!!editingVisit}
        visit={editingVisit}
        onClose={() => setEditingVisit(null)}
        onSuccess={fetchVisits}
      />

      {/* Visit details modal */}
      {selectedVisitDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-emerald-900/45 p-4 backdrop-blur-[6px]">
          <div className="relative my-8 w-full max-w-md overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(5,150,105,0.08),0_24px_64px_rgba(6,78,59,0.2),0_8px_24px_rgba(0,0,0,0.08)]">
            {/* Header with color accent */}
            <div
              className="relative px-6 pt-6 pb-14"
              style={{
                backgroundColor: selectedVisitDetails.color || "#10b981",
              }}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-45 w-45 rounded-full border border-white/10"></div>
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <span className="mb-2 inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
                    Détails de la Visite
                  </span>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedVisitDetails.client?.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedVisitDetails(null)}
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

            {/* Body */}
            <div className="relative z-10 -mt-8 space-y-5 p-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Date & Heure
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(selectedVisitDetails.date).toLocaleString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">
                  <svg
                    className="h-4 w-4 text-gray-400"
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
                  Commerciaux Assignés
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedVisitDetails.commercialsList?.length > 0 ? (
                    selectedVisitDetails.commercialsList.map((c) => (
                      <div
                        key={c._id}
                        className="flex items-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5"
                      >
                        <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-[0.65rem] font-bold text-emerald-800">
                          {c.name.charAt(0)}
                        </div>
                        <p className="text-sm font-semibold text-emerald-900">
                          {c.name}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Non assigné</p>
                  )}
                </div>
              </div>

              {selectedVisitDetails.products?.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">
                    <svg
                      className="h-4 w-4 text-gray-400"
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
                    Produits ({selectedVisitDetails.products.length})
                  </div>
                  <div className="space-y-2">
                    {selectedVisitDetails.products.map((item) => (
                      <div
                        key={item.product?._id || item._id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                      >
                        <span className="truncate text-sm font-medium text-gray-700">
                          • {item.product?.name || "Produit supprimé"}
                        </span>
                        <span className="ml-2 rounded-md bg-emerald-100 px-2 py-0.5 text-sm font-bold text-emerald-700">
                          x {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedVisitDetails.notes && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-amber-800">
                    <svg
                      className="h-4 w-4 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Notes
                  </div>
                  <p className="text-sm italic leading-relaxed text-amber-900">
                    "{selectedVisitDetails.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer with Edit/Delete */}
            <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-4 space-x-3">
              {(user?._id === selectedVisitDetails.createdBy ||
                isSuperCommercial) && (
                <>
                  <button
                    onClick={() => {
                      setEditingVisit(selectedVisitDetails);
                      setSelectedVisitDetails(null);
                    }}
                    className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    ✎ Modifier
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(selectedVisitDetails)}
                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    🗑 Supprimer
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedVisitDetails(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Êtes‑vous sûr de vouloir supprimer la visite du{" "}
              <strong>
                {new Date(deleteConfirm.date).toLocaleDateString("fr-FR")}
              </strong>{" "}
              chez <strong>{deleteConfirm.client?.name}</strong> ?<br />
              Les stocks seront rétablis.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    await visitService.deleteVisit(deleteConfirm._id);
                    setDeleteConfirm(null);
                    setSelectedVisitDetails(null);
                    fetchVisits();
                  } catch (error) {
                    alert(
                      error.response?.data?.message ||
                        "Erreur lors de la suppression",
                    );
                  }
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
