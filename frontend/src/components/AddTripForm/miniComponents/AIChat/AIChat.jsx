import { useEffect, useRef, useState, React } from "react";
import toast from "react-hot-toast";
import "./AIChat.css";
import { API_URL } from "../../../../config";

const AIChat = ({ darkMode, trip }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm WayAway AI.\nAsk me anything about your travel costs.",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (isLoading) {
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    const userMessage = {
      role: "user",
      content: message.trim(),
    };

    try {
      setIsLoading(true);
      setMessages((prev) => [...prev, userMessage]);
      setMessage("");

      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          messages,
          trip: {
            ...trip,
            startDate: trip.startDate
              ? new Date(trip.startDate).toISOString().split("T")[0]
              : null,
            endDate: trip.endDate
              ? new Date(trip.endDate).toISOString().split("T")[0]
              : null,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "AI request failed.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressedKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`ai-chat-wrapper ${darkMode ? "white-letters" : ""}`}>
      {isOpen && (
        <div className={`ai-chat ${darkMode ? "ai-chat-dark" : ""}`}>
          <div className="ai-chat-header">
            <div>
              <h3>WayAway AI</h3>
              <span>Travel cost assistant</span>
            </div>
          </div>
          <div
            className={`ai-chat-messages ${darkMode ? "ai-chat-messages-dark" : ""}`}
          >
            {messages.map((chatMessage, index) => (
              <div
                key={index}
                className={`ai-chat-message-row ${chatMessage.role === "user" ? "ai-chat-user-row" : "ai-chat-assistant-row"}`}
              >
                <div
                  className={`ai-chat-message ${chatMessage.role === "user" ? "ai-chat-user-message" : "ai-chat-assistant-message"}`}
                >
                  {chatMessage.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-chat-message-row ai-chat-assistant-row">
                <div className="ai-chat-message ai-chat-assistant-message ai-chat-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>
          <div
            className={`ai-chat-input-area ${darkMode ? "ai-chat-input-area-dark" : ""}`}
          >
            <div className="ai-chat-input-wrapper">
              <textarea
                className={darkMode ? "ai-chat-textarea-dark" : ""}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about your estimated travel costs..."
                maxLength={300}
                disabled={isLoading}
                onKeyDown={handlePressedKey}
              />
              <div className="ai-chat-counter">{message.length}/300</div>
              <button
                type="button"
                className="ai-chat-send"
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        className={`ai-chat-toggle ${darkMode ? "ai-chat-toggle-dark" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? "X" : "AI"}
      </button>
    </div>
  );
};

export default AIChat;
