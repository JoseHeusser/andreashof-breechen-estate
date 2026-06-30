import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Hidden behind VITE_AI_AGENT until we're happy with the persona.
// To enable locally: VITE_AI_AGENT=true in .env.local + restart vite.
//
// Voice: the house in first person, discreet. The persona lives in the
// server-side system prompt (src/lib/agent/system-prompt.ts) — this
// widget is just the UI shell.

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "andreashof.chat";
const GREETING: Message = {
  role: "assistant",
  content:
    "Hallo — ich bin der Andreashof. Frag mich nach Verfügbarkeit, Preisen, Zimmern oder der Umgebung. Antworte gerne auf Deutsch, English oder Español.",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [tool, setTool] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Persist session — clears on browser close.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, busy]);

  // Focus the input when opened.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    setError(null);
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setTool(null);
    // Add an empty assistant placeholder we'll stream into.
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) throw new Error("server error");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let eventStart;
        // SSE: events separated by blank lines
        while ((eventStart = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, eventStart);
          buffer = buffer.slice(eventStart + 2);
          const lines = chunk.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;
          const event = eventLine.slice(6).trim();
          const data = dataLine.slice(5).trim();
          if (event === "token") {
            try {
              assistantText += JSON.parse(data) as string;
              setMessages((m) => {
                const copy = m.slice();
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            } catch {
              /* ignore parse */
            }
          } else if (event === "tool") {
            try {
              const parsed = JSON.parse(data) as { name?: string };
              setTool(parsed.name ?? null);
            } catch {
              /* ignore */
            }
          } else if (event === "error") {
            try {
              const parsed = JSON.parse(data) as { message?: string };
              throw new Error(parsed.message ?? "agent failed");
            } catch (e) {
              throw e instanceof Error ? e : new Error("agent failed");
            }
          } else if (event === "done") {
            setTool(null);
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verbindung verloren");
      setMessages((m) => {
        // Remove the empty assistant placeholder we added if nothing streamed.
        const copy = m.slice();
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && last.content === "") copy.pop();
        return copy;
      });
    } finally {
      setBusy(false);
      setTool(null);
    }
  }, [busy, input, messages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => {
    setMessages([GREETING]);
    setError(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const toolLabel = useMemo(() => {
    if (!tool) return null;
    switch (tool) {
      case "check_availability":
        return "Ich schaue im Kalender…";
      case "get_pricing_quote":
        return "Ich berechne den Preis…";
      case "create_booking_request":
        return "Ich lege die Anfrage an…";
      default:
        return "Einen Moment…";
    }
  }, [tool]);

  return (
    <div className="fixed bottom-4 right-4 z-[80] md:bottom-6 md:right-6">
      {/* Trigger button */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Chat öffnen"
          className="flex h-14 w-14 items-center justify-center border border-foreground bg-foreground text-background shadow-lg transition-colors hover:bg-sage-deep hover:border-sage-deep md:h-16 md:w-16"
        >
          <ChatIcon />
        </button>
      ) : null}

      {/* Panel */}
      {open ? (
        <div className="flex h-[80vh] max-h-[640px] w-[92vw] max-w-[420px] flex-col border border-border bg-card shadow-2xl">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border bg-foreground px-4 py-3 text-background">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-background/70">
                Andreashof
              </p>
              <p className="font-display text-base font-light italic">
                Ich beantworte gerne deine Fragen.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reset}
                aria-label="Neue Konversation"
                title="Neue Konversation"
                className="flex h-8 w-8 items-center justify-center text-background/70 transition-colors hover:bg-background/10 hover:text-background"
              >
                ↻
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Schließen"
                className="flex h-8 w-8 items-center justify-center text-background/70 transition-colors hover:bg-background/10 hover:text-background"
              >
                ×
              </button>
            </div>
          </header>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-background px-4 py-4">
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} />
            ))}
            {busy && toolLabel ? (
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                · {toolLabel}
              </p>
            ) : null}
            {error ? (
              <p className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          {/* Input */}
          <footer className="border-t border-border bg-card px-3 py-2">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Frag mich etwas — Daten, Preise, Zimmer…"
                rows={1}
                className="max-h-24 min-h-9 flex-1 resize-none border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-sage-deep"
                disabled={busy}
              />
              <button
                type="button"
                onClick={send}
                disabled={busy || !input.trim()}
                className="flex h-9 w-9 items-center justify-center border border-foreground bg-foreground text-background transition-colors hover:bg-sage-deep hover:border-sage-deep disabled:opacity-40 disabled:hover:bg-foreground disabled:hover:border-foreground"
                aria-label="Senden"
              >
                ↑
              </button>
            </div>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Beta · powered by Claude
            </p>
          </footer>
        </div>
      ) : null}
    </div>
  );
}

function MessageBubble({ role, content }: Message) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] border border-foreground bg-foreground px-3 py-2 text-sm text-background">
          {content}
        </p>
      </div>
    );
  }
  return (
    <div className="flex">
      <p className="max-w-[88%] whitespace-pre-wrap border border-border bg-card px-3 py-2 text-sm leading-relaxed text-foreground">
        {content || <span className="text-muted-foreground">…</span>}
      </p>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5h16v11H8l-4 4V5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
