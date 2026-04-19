import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Loader2, Sparkles, RotateCcw } from "lucide-react";

// Minimal markdown renderer — handles bold, inline code, code blocks, and line breaks
function MarkdownText({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={i} className="chat-code-block">
          {lang && <span className="chat-code-lang">{lang}</span>}
          <pre><code>{codeLines.join("\n")}</code></pre>
        </div>
      );
      i++;
      continue;
    }

    // Inline formatting
    const formatted = formatInline(line, i);
    if (line.trim() === "") {
      elements.push(<div key={i} className="chat-spacer" />);
    } else {
      elements.push(<p key={i} className="chat-paragraph">{formatted}</p>);
    }
    i++;
  }

  return <div className="chat-markdown">{elements}</div>;
}

function formatInline(text, keyBase) {
  // Split on **bold**, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyBase}-${idx}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${keyBase}-${idx}`} className="chat-inline-code">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function TypingDots() {
  return (
    <div className="typing-dots" aria-label="AI is thinking">
      <span /><span /><span />
    </div>
  );
}

function ChatAi({ problem }) {
  const INITIAL_MESSAGES = [
    {
      role: "model",
      parts: [{ text: `Hey! I'm your AI assistant for **${problem?.title || "this problem"}**.\n\nI can help with:\n- **Hints** — nudges without spoilers\n- **Explanations** — breaking down concepts\n- **Code review** — optimizing your solution\n\nWhat do you need?` }]
    }
  ];

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const messageValue = watch("message", "");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    inputRef.current?.focus();
  };

  const onSubmit = async (data) => {
    const trimmed = data.message.trim();
    if (!trimmed) return;

    const userMessage = { role: "user", parts: [{ text: trimmed }] };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    reset();
    setIsLoading(true);

    try {
      const response = await axiosClient.post("/ai/chat", {
        messages: updatedMessages,
        title: problem.title,
        description: problem.description,
        testCases: problem.visibleTestCases,
        startCode: problem.startCode
      });

      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: response.data.message || "No response received." }] }
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "Something went wrong. Please try again." }] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      <style>{`
        .chat-ai-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 82vh;
          min-height: 520px;
          background: var(--chat-bg, #0f1117);
          border: 1px solid var(--chat-border, rgba(255,255,255,0.07));
          border-radius: 20px;
          overflow: hidden;
          font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
          color: var(--chat-text, #e8eaf0);
        }

        /* Header */
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--chat-border, rgba(255,255,255,0.07));
          background: var(--chat-header-bg, rgba(255,255,255,0.02));
        }
        .chat-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chat-header-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .chat-header h2 {
          font-size: 15px;
          font-weight: 650;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .chat-header p {
          font-size: 12px;
          margin: 0;
          opacity: 0.45;
        }
        .chat-clear-btn {
          background: none;
          border: none;
          color: inherit;
          opacity: 0.4;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          transition: opacity 0.15s, background 0.15s;
        }
        .chat-clear-btn:hover {
          opacity: 0.8;
          background: rgba(255,255,255,0.06);
        }

        /* Messages */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .chat-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          animation: msgIn 0.22s ease both;
        }
        .chat-row.user { flex-direction: row-reverse; }

        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .chat-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .chat-avatar.model { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
        .chat-avatar.user  { background: rgba(255,255,255,0.08); }

        .chat-bubble {
          max-width: 78%;
          border-radius: 18px;
          padding: 11px 15px;
          font-size: 13.5px;
          line-height: 1.6;
        }
        .chat-bubble.model {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          border-bottom-left-radius: 5px;
        }
        .chat-bubble.user {
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: #fff;
          border-bottom-right-radius: 5px;
        }

        /* Markdown inside bubbles */
        .chat-markdown { display: flex; flex-direction: column; gap: 4px; }
        .chat-paragraph { margin: 0; }
        .chat-spacer { height: 6px; }
        .chat-inline-code {
          font-family: 'Fira Code', 'JetBrains Mono', monospace;
          font-size: 12px;
          background: rgba(99,102,241,0.2);
          color: #a5b4fc;
          padding: 1px 5px;
          border-radius: 4px;
        }
        .chat-code-block {
          margin: 6px 0;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          background: #0d0f18;
        }
        .chat-code-lang {
          display: block;
          padding: 4px 12px;
          font-size: 10px;
          font-family: monospace;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: rgba(99,102,241,0.15);
          color: #818cf8;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .chat-code-block pre {
          margin: 0;
          padding: 12px;
          overflow-x: auto;
          font-family: 'Fira Code', 'JetBrains Mono', monospace;
          font-size: 12.5px;
          line-height: 1.6;
          color: #c7d2fe;
        }

        /* Typing dots */
        .typing-dots {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 4px 2px;
        }
        .typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6366f1;
          animation: dot-bounce 1.2s infinite ease-in-out;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Input area */
        .chat-input-area {
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 14px 16px;
          background: var(--chat-header-bg, rgba(255,255,255,0.02));
        }
        .chat-input-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 8px 8px 8px 14px;
          transition: border-color 0.2s;
        }
        .chat-input-row:focus-within {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
        .chat-input-row textarea {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: inherit;
          font-size: 13.5px;
          font-family: inherit;
          line-height: 1.5;
          resize: none;
          max-height: 120px;
          min-height: 22px;
          padding: 2px 0;
        }
        .chat-input-row textarea::placeholder { opacity: 0.35; }
        .chat-send-btn {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, opacity 0.15s;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: #fff;
        }
        .chat-send-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          transform: none;
        }
        .chat-send-btn:not(:disabled):hover { transform: scale(1.05); }
        .chat-send-btn:not(:disabled):active { transform: scale(0.95); }
        .chat-hint {
          margin-top: 8px;
          font-size: 11px;
          opacity: 0.3;
          text-align: center;
        }
        .chat-error {
          margin-top: 6px;
          font-size: 11px;
          color: #f87171;
        }
      `}</style>

      <div className="chat-ai-root">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-header-icon">
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <h2>AI Assistant</h2>
              <p>Hints · Explanations · Code review</p>
            </div>
          </div>
          <button className="chat-clear-btn" onClick={clearChat} title="Clear chat">
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div key={index} className={`chat-row ${isUser ? "user" : "model"}`}>
                <div className={`chat-avatar ${isUser ? "user" : "model"}`}>
                  {isUser
                    ? <User size={14} color="rgba(255,255,255,0.7)" />
                    : <Bot size={14} color="#fff" />
                  }
                </div>
                <div className={`chat-bubble ${isUser ? "user" : "model"}`}>
                  {isUser
                    ? msg.parts[0].text
                    : <MarkdownText text={msg.parts[0].text} />
                  }
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="chat-row model" style={{ animation: "msgIn 0.22s ease both" }}>
              <div className="chat-avatar model">
                <Bot size={14} color="#fff" />
              </div>
              <div className="chat-bubble model">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="chat-input-row">
              <textarea
                rows={1}
                placeholder="Ask for a hint, or paste your code…"
                onKeyDown={handleKeyDown}
                ref={(el) => {
                  register("message", { required: true, minLength: 2 }).ref(el);
                  inputRef.current = el;
                }}
                {...register("message", { required: true, minLength: 2 })}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={isLoading || !messageValue?.trim() || messageValue?.trim().length < 2}
              >
                {isLoading
                  ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                  : <Send size={15} />
                }
              </button>
            </div>
            {errors.message && (
              <p className="chat-error">Please enter at least 2 characters.</p>
            )}
            <p className="chat-hint">Enter to send · Shift+Enter for new line</p>
          </form>
        </div>
      </div>
    </>
  );
}

export default ChatAi;
