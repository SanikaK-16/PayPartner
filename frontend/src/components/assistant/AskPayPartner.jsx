import { useState } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  TrendingUp,
  CreditCard,
  Users,
  Mic,
} from "lucide-react";
import VoiceAssistant from "./VoiceAssistant";

const suggestions = [
  {
    label: "What needs my attention?",
    icon: Sparkles,
  },
  {
    label: "Why did sales drop?",
    icon: TrendingUp,
  },
  {
    label: "Show failed payments",
    icon: CreditCard,
  },
  {
    label: "Which customers should I target?",
    icon: Users,
  },
];

function getDemoResponse(message) {
  const query = message.toLowerCase();

  if (
    query.includes("failed") ||
    query.includes("payment") ||
    query.includes("attention")
  ) {
    return {
      text: "You have 1 high-priority opportunity: failed payments worth ₹4,200 are currently at risk. PayPartner recommends starting a payment recovery action within your configured policy limits.",
      type: "opportunity",
    };
  }

  if (
    query.includes("sales") ||
    query.includes("drop") ||
    query.includes("pattern")
  ) {
    return {
      text: "Recent sales activity shows a change compared with the previous period. The current pattern suggests that customer repeat purchases are contributing to the change. I recommend reviewing the repeat-customer opportunity.",
      type: "insight",
    };
  }

  if (
    query.includes("customer") ||
    query.includes("target") ||
    query.includes("repeat")
  ) {
    return {
      text: "Your customer data shows a group of repeat purchasers who may be suitable for a retention-focused offer. Any recommendation should remain within your configured customer-offer and discount policies.",
      type: "customer",
    };
  }

  return {
    text: "I can help you understand your business activity, identify opportunities, explain trends, and suggest actions within your configured policies.",
    type: "general",
  };
}

function AskPayPartner() {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = (text = message) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) return;

    const response = getDemoResponse(trimmedMessage);

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "user",
        text: trimmedMessage,
      },
      {
        id: Date.now() + 1,
        role: "assistant",
        text: response.text,
        type: response.type,
      },
    ]);

    setMessage("");
  };

  const handleSuggestion = (suggestion) => {
    handleSend(suggestion);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-primary/90 hover:shadow-xl"
        >
          <Bot size={20} strokeWidth={1.9} />
          <span>Ask PayPartner</span>
        </button>
      )}

      {/* Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[min(680px,calc(100vh-48px))] w-[min(420px,calc(100vw-48px))] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bot size={21} strokeWidth={1.8} />
              </div>

              <div>
                <p className="text-sm font-semibold text-navy">
                  Ask PayPartner
                </p>

                <p className="text-xs text-text-secondary">
                  Your business intelligence assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-navy"
              aria-label="Close Ask PayPartner"
            >
              <X size={19} strokeWidth={1.8} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-background/50 p-4">
            {messages.length === 0 ? (
              <div className="flex min-h-full flex-col justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles size={25} strokeWidth={1.7} />
                  </div>

                  <h2 className="mt-4 text-lg font-semibold text-navy">
                    How can I help?
                  </h2>

                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-text-secondary">
                    Ask about your sales, customers, transactions, or
                    opportunities.
                  </p>
                </div>

                <div className="mt-7 space-y-2">
                  {suggestions.map((suggestion) => {
                    const Icon = suggestion.icon;

                    return (
                      <button
                        key={suggestion.label}
                        type="button"
                        onClick={() => handleSuggestion(suggestion.label)}
                        className="flex w-full items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-left text-sm text-text transition hover:border-primary/30 hover:bg-primary/5"
                      >
                        <Icon
                          size={17}
                          className="shrink-0 text-primary"
                          strokeWidth={1.8}
                        />

                        <span>{suggestion.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={`flex ${
                      item.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {item.role === "user" ? (
                      <div className="max-w-[82%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-white">
                        {item.text}
                      </div>
                    ) : (
                      <div className="flex max-w-[88%] gap-2.5">
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Bot size={15} strokeWidth={1.8} />
                        </div>

                        <div className="rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3 text-sm leading-6 text-text shadow-sm">
                          {item.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border bg-white p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
                placeholder="Ask anything about your business..."
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-text outline-none placeholder:text-text-secondary/70"
              />

              {/* Voice Button */}
              <button
                type="button"
                onClick={() => setVoiceOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition hover:bg-white hover:text-primary"
                aria-label="Use voice"
              >
                <Mic size={17} strokeWidth={1.9} />
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!message.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={17} strokeWidth={1.9} />
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-text-secondary">
              PayPartner recommendations follow your configured policies.
            </p>
          </div>
        </div>
      )}

      {/* Voice Assistant */}
      {voiceOpen && (
        <VoiceAssistant onClose={() => setVoiceOpen(false)} />
      )}
    </>
  );
}

export default AskPayPartner;