import React from "react";

const MessageBubble = ({ message, isUser }) => {
  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-1`}
    >
      {/* Small Bot Avatar (Only shows for the bot) */}
      {!isUser && (
        <div className="shrink-0 mr-2.5 flex items-end pb-0.5">
          <div className="w-6 h-6 rounded-full bg-linear-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm">
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed shadow-sm transition-all ${
          isUser
            ? "bg-linear-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl rounded-br-sm"
            : "bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-bl-sm"
        }`}
      >
        {message}
      </div>
    </div>
  );
};

export default MessageBubble;
