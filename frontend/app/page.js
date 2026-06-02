'use client';

import React, { useState } from 'react';
import ChatPanel from '../components/ChatPanel';
import ReportPanel from '../components/ReportPanel';

export default function Home() {
  // Central application state
  const [messages, setMessages] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');

  var lastUserPrompt = messages
    .filter(function(m) { return m.role === "user"; })
    .pop()?.content || "";

  // Primary async action to send messages and retrieve reports from Express backend
  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    // Clear previous errors
    setError(null);
    setInput('');

    // Append user message
    const userMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // POST the full history of messages to the Express backend endpoint
      const response = await fetch('http://localhost:3001/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      if (!data.report) {
        throw new Error("Invalid response format. Missing 'report' payload.");
      }

      // Update the live report dashboard state
      setReport(data.report);

      // Append assistant confirmation message with reportPayload embedded
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Success! I have generated a comprehensive live report for "${text}". You can review the metric cards, comparative chart representation, and qualitative insights on the right-hand panel.`,
          reportPayload: data.report
        }
      ]);

    } catch (err) {
      console.error("API error details:", err);
      
      const errorMessage = err.message || "Failed to communicate with the report generation engine.";
      
      // Update error state
      setError(errorMessage);
      
      // Append assistant error explanation
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Failed to generate report: ${errorMessage}. Please make sure the Express backend server is running on port 3001 and your Anthropic Claude API key is correctly configured.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Synchronized manual edit handler
  const handleSaveReport = (updatedReport) => {
    // 1. Update the primary report render state
    setReport(updatedReport);

    // 2. Proactively update the reportPayload in the latest assistant chat history message,
    // ensuring subsequent conversational edits build on top of manual edits!
    setMessages(prev => {
      const newMessages = [...prev];
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].role === 'assistant') {
          newMessages[i] = {
            ...newMessages[i],
            reportPayload: updatedReport
          };
          break;
        }
      }
      return newMessages;
    });
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#fafaf8]">
      {/* Left Column: Fixed Width 340px Chat Window */}
      <ChatPanel
        messages={messages}
        loading={loading}
        input={input}
        setInput={setInput}
        onSend={sendMessage}
      />

      {/* Right Column: Flex-1 Executive Report Board */}
      <ReportPanel
        report={report}
        prompt={lastUserPrompt}
        loading={loading}
        error={error}
        onExampleClick={sendMessage}
        onSave={handleSaveReport}
      />
    </main>
  );
}
