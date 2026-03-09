import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { sendMessage } from "../../services/chatbotService";

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]); // Added loading so it scrolls down when the typing indicator appears

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setLoading(true);

    try {
      const reply = await sendMessage(userMessage);
      setMessages((prev) => [...prev, { text: reply, isUser: false }]);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Désolé, je rencontre des difficultés pour me connecter.",
          isUser: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    // If you aren't using the parent wrapper for positioning, keep the fixed positioning here.
    // Notice the h-[500px] instead of h-125 (which isn't a standard Tailwind class)
    <div className="w-85 sm:w-95 h-125 bg-slate-50 rounded-2xl shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden border border-slate-200/60 z-50">
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-500 px-5 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center space-x-3">
          {/* Avatar / Icon */}
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">
              Assistant OptimedLab
            </h3>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              <span className="text-emerald-100 text-xs">En ligne</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors focus:outline-none"
          aria-label="Close chat"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3 opacity-70">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-2">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">
              Comment puis-je vous aider ?
            </p>
            <p className="text-slate-500 text-xs">
              Posez-moi des questions sur vos devis, factures ou stocks.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg.text} isUser={msg.isUser} />
        ))}

        {loading && (
          <div className="flex justify-start mt-2">
            <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex space-x-1.5 items-center h-4">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <div
                  className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            className="w-full bg-slate-100 border border-transparent text-slate-700 placeholder-slate-400 rounded-full pl-5 pr-12 py-3 text-sm transition-all focus:outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`absolute right-1.5 p-2 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !loading
                ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md"
                : "bg-transparent text-slate-400"
            }`}
          >
            <svg
              className={`w-5 h-5 ${input.trim() && !loading ? "translate-x-0.5" : ""} transition-transform`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
