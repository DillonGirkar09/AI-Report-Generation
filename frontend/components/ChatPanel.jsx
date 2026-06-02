import React, { useRef, useEffect } from 'react';

export default function ChatPanel({
  messages,
  loading,
  input,
  setInput,
  onSend,
  suggestions = [
    "AI adoption by country 2026",
    "Space tech investment leaders",
    "Top AI talent hubs globally",
    "Enterprise AI usage by industry",
    "Which countries are rising fastest in tech?"
  ]
}) {
  const messagesEndRef = useRef(null);

  // Smooth scroll to the bottom of the conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSend(input.trim());
    }
  };

  return (
    <div className="w-[340px] shrink-0 h-full bg-white border-r border-neutral-200 flex flex-col justify-between shadow-lg relative z-10">
      
      {/* Header Banner */}
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1d4ed8] to-[#3b82f6] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            F
          </div>
          <div>
            <h1 className="text-sm font-bold text-neutral-800 leading-tight">
              ForceEquals Reports
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wide uppercase">
                AI Powered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion Section */}
      <div className="px-4 pt-4 pb-2 border-b border-neutral-50 shrink-0">
        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">
          Suggestions
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto custom-scrollbar pr-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              disabled={loading}
              onClick={() => onSend(suggestion)}
              className="text-[11px] font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-full px-2.5 py-1 text-left transition-all duration-200 hover:bg-neutral-100 hover:border-neutral-300 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Log Panel */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
              💬
            </div>
            <p className="text-[13px] font-bold text-neutral-600">Start a conversation</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-[200px]">
              Ask me to generate a beautiful structured report on space, AI talent, industries, or countries.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm transition-all duration-300 ${
                    isUser
                      ? 'bg-[#1d4ed8] text-white rounded-tr-none font-medium'
                      : 'bg-[#f0efeb] text-neutral-800 rounded-tl-none font-normal'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}

        {/* Bouncing Dots Loading Bubble */}
        {loading && (
          <div className="flex w-full justify-start">
            <div className="bg-[#f0efeb] text-neutral-800 rounded-2xl rounded-tl-none px-3.5 py-2.5 flex items-center gap-1 shadow-sm shrink-0">
              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce-delay animation-delay-0"></span>
              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce-delay animation-delay-1"></span>
              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce-delay"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form at Bottom */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-100 bg-white shrink-0">
        <div className="flex items-center gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={loading ? "Generating report..." : "Ask for a report…"}
            className="flex-1 text-xs border border-neutral-200 focus:border-[#1d4ed8] rounded-full pl-4 pr-11 py-3 outline-none transition-all duration-300 disabled:opacity-50 disabled:bg-neutral-50 disabled:cursor-not-allowed placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`absolute right-1.5 top-1.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
              input.trim() && !loading
                ? 'bg-[#1d4ed8] text-white hover:bg-blue-700 shadow-md'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <svg
              className="w-4 h-4 transform rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>

    </div>
  );
}
