// src/pages/Calendar.jsx
import { useState, useEffect } from "react";
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

  // Check if Super Commercial
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

  // Convert backend data to FullCalendar format
  const events = visits.map((visit) => ({
    id: visit._id,
    title: visit.client?.name || "Client inconnu",
    extendedProps: {
      ...visit,
      commercialName: visit.commercial?.name || "Non assigné",
    },
    start: visit.date,
    backgroundColor: visit.color || "#10b981",
    borderColor: "transparent",
  }));

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

  // CUSTOM EVENT RENDERER: Makes the events look like modern badges
  const renderEventContent = (eventInfo) => {
    return (
      <div className="flex flex-col px-1.5 py-1 w-full overflow-hidden transition-all hover:scale-[1.02]">
        <span className="font-bold text-xs truncate drop-shadow-sm text-white">
          {eventInfo.event.title}
        </span>
        <span className="text-[10px] font-medium opacity-90 truncate text-white">
          👤 {eventInfo.event.extendedProps.commercialName}
        </span>
      </div>
    );
  };

  return (
    <div className="container mx-auto pb-10 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Agenda des Visites
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">
            Planification globale des livraisons et visites de l'équipe
            commerciale.
          </p>
        </div>

        {isSuperCommercial && (
          <button
            onClick={openFormForToday}
            className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-emerald-600 border border-transparent rounded-full hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90"
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

      {/* Calendar Card Wrapper */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-8 relative overflow-hidden">
        {/* CSS Overrides to modernize FullCalendar */}
        <style>{`
          .fc {
            --fc-border-color: #f1f5f9;
            --fc-button-bg-color: #ffffff;
            --fc-button-border-color: #e2e8f0;
            --fc-button-text-color: #475569;
            --fc-button-hover-bg-color: #f8fafc;
            --fc-button-hover-border-color: #cbd5e1;
            --fc-button-active-bg-color: #f1f5f9;
            --fc-button-active-border-color: #cbd5e1;
            font-family: inherit;
          }
          .fc .fc-button-primary {
            border-radius: 0.75rem;
            font-weight: 600;
            text-transform: capitalize;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            transition: all 0.2s;
          }
          .fc .fc-toolbar-title {
            font-weight: 800;
            font-size: 1.5rem;
            color: #1e293b;
            text-transform: capitalize;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border-color: #f1f5f9;
          }
          .fc-col-header-cell-cushion {
            font-weight: 600;
            color: #64748b;
            padding: 12px 0 !important;
          }
          .fc-daygrid-day-number {
            font-weight: 600;
            color: #334155;
            padding: 8px !important;
          }
          .fc-event {
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            cursor: pointer;
            margin: 2px 4px !important;
          }
          .fc-daygrid-day.fc-day-today {
            background-color: #f0fdf4 !important;
          }
        `}</style>

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
          height="80vh"
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

      <VisitForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchVisits}
        initialDate={selectedDate}
      />

      {/* MODERNIZED VISIT DETAILS MODAL */}
      {selectedVisitDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]">
            {/* Header Area with Color Banner */}
            <div
              className="px-6 py-5 flex justify-between items-start relative shrink-0"
              style={{
                backgroundColor: selectedVisitDetails.color || "#10b981",
              }}
            >
              <div className="text-white relative z-10">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-2">
                  Détails de la Visite
                </span>
                <h2 className="text-2xl font-bold leading-tight">
                  {selectedVisitDetails.client?.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedVisitDetails(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body Area (Scrollable) */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Date & Time block */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    className="w-5 h-5 text-slate-400"
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
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-500">
                    Date et Heure
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {new Date(selectedVisitDetails.date).toLocaleString(
                      "fr-FR",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              </div>

              {/* Commercial block */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-slate-500">
                    Assigné à
                  </p>
                  <div className="mt-1 flex items-center bg-slate-50 border border-slate-100 rounded-xl p-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 mr-3">
                      {selectedVisitDetails.commercialName.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedVisitDetails.commercialName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products block (UPDATED FOR QUANTITIES) */}
              {selectedVisitDetails.products?.length > 0 && (
                <div className="flex items-start border-t border-slate-100 pt-5">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-slate-400"
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
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-slate-500 mb-2">
                      Produits à livrer ({selectedVisitDetails.products.length})
                    </p>
                    <div className="space-y-2">
                      {selectedVisitDetails.products.map((item) => (
                        <div
                          key={item.product?._id || item._id}
                          className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex justify-between items-center"
                        >
                          <span className="truncate pr-2">
                            • {item.product?.name || "Produit supprimé"}
                          </span>
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                            x {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes block */}
              {selectedVisitDetails.notes && (
                <div className="flex items-start border-t border-slate-100 pt-5">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-slate-400"
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
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Notes / Instructions
                    </p>
                    <p className="text-sm bg-yellow-50/50 text-yellow-900 p-3 rounded-xl border border-yellow-100/50 italic leading-relaxed">
                      "{selectedVisitDetails.notes}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedVisitDetails(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
