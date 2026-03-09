import { useState } from "react";
import ChatWindow from "./ChatWindow";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleChat}
        className={`
          fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center 
          transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
          ${
            isOpen
              ? "bg-white text-slate-600 border border-slate-200 shadow-xl hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-200 rotate-0"
              : "bg-linear-to-tr from-emerald-600 to-teal-500 text-white shadow-[0_8px_30px_rgb(16,185,129,0.4)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.6)] hover:-translate-y-1 focus:ring-emerald-500"
          }
        `}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Inner Icon with smooth rotation transition */}
        <div
          className={`transition-transform duration-300 flex items-center justify-center ${isOpen ? "rotate-90 scale-110" : "rotate-0"}`}
        >
          {isOpen ? (
            // Close 'X' Icon (thinner, classy stroke)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // Chat Bubble Icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Chat window popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <ChatWindow onClose={toggleChat} />
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
