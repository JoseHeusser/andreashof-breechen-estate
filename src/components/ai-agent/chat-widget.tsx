import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Hidden behind VITE_AI_AGENT until we're happy with the persona.
// To enable locally: VITE_AI_AGENT=true in .env.local + restart vite.
//
// Voice: the house in first person, discreet. The persona lives in the
// server-side system prompt (src/lib/agent/system-prompt.ts) — this
// widget is just the UI shell.

// Free windows from the list_available_dates tool, drawn as a calendar.
interface CalendarData {
  from: string;
  to: string;
  free_windows: { arrival: string; departure: string; nights: number }[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  calendar?: CalendarData;
}

const STORAGE_KEY = "andreashof.chat";
const GREETING: Message = {
  role: "assistant",
  content:
    "Hallo — ich bin der digitale Assistent des Andreashofs, eine KI. Frag mich nach Verfügbarkeit, Preisen, Zimmern oder der Umgebung. Antworte gerne auf Deutsch, English oder Español.",
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
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: assistantText };
                return copy;
              });
            } catch {
              /* ignore parse */
            }
          } else if (event === "calendar") {
            try {
              const calendar = JSON.parse(data) as CalendarData;
              setMessages((m) => {
                const copy = m.slice();
                copy[copy.length - 1] = { ...copy[copy.length - 1], calendar };
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
      case "list_available_dates":
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
    <div className="fixed bottom-4 left-4 z-[80] md:bottom-6 md:left-6">
      {/* Trigger button */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Chat öffnen"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition-colors hover:border-sage-deep hover:text-sage-deep md:h-16 md:w-16"
        >
          <ChatIcon />
        </button>
      ) : null}

      {/* Panel */}
      {open ? (
        <div className="flex h-[80vh] max-h-[640px] w-[92vw] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
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
              <MessageBubble key={i} {...m} />
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
                className="max-h-24 min-h-9 flex-1 resize-none rounded-full border border-border bg-background px-4 py-2 text-sm outline-none transition-colors focus:border-sage-deep"
                disabled={busy}
              />
              <button
                type="button"
                onClick={send}
                disabled={busy || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground bg-foreground text-background transition-colors hover:bg-sage-deep hover:border-sage-deep disabled:opacity-40 disabled:hover:bg-foreground disabled:hover:border-foreground"
                aria-label="Senden"
              >
                ↑
              </button>
            </div>
            <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground/80">
              KI-Assistent (Claude von Anthropic). Antworten ohne Gewähr — verbindlich ist
              Andreas Bestätigung. Bitte keine sensiblen Daten eingeben.{" "}
              <a href="/datenschutz#chat" className="underline underline-offset-2 hover:text-sage-deep">
                Datenschutz
              </a>
            </p>
          </footer>
        </div>
      ) : null}
    </div>
  );
}

function MessageBubble({ role, content, calendar }: Message) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md border border-foreground bg-foreground px-4 py-2 text-sm text-background">
          {content}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-border bg-card px-4 py-2 text-sm leading-relaxed text-foreground">
        {content || <span className="text-muted-foreground">…</span>}
      </p>
      {calendar ? <AvailabilityCalendar data={calendar} /> : null}
    </div>
  );
}

// ─── Availability calendar ──────────────────────────────────────────────────
// Free nights in sage, everything else muted. One grid per month in the
// requested period; days outside it are left blank.

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_FMT = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "UTC" });
const MAX_MONTHS = 6;

function AvailabilityCalendar({ data }: { data: CalendarData }) {
  const free = new Set<string>();
  for (const w of data.free_windows) {
    for (let d = utc(w.arrival); d < utc(w.departure); d = plusDays(d, 1)) free.add(iso(d));
  }
  const first = utc(data.from);
  const months: Date[] = [];
  for (
    let m = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1));
    m < utc(data.to) && months.length < MAX_MONTHS;
    m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1))
  ) {
    months.push(m);
  }

  return (
    <div className="w-[88%] space-y-3 rounded-2xl border border-border bg-card px-3 py-3">
      {months.map((m) => {
        const offset = (m.getUTCDay() + 6) % 7; // Monday first
        const daysInMonth = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0)).getUTCDate();
        const cells: (string | null)[] = Array(offset).fill(null);
        for (let day = 1; day <= daysInMonth; day++) {
          cells.push(iso(new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), day))));
        }
        return (
          <div key={iso(m)}>
            <p className="mb-1.5 text-xs font-medium capitalize text-foreground">{MONTH_FMT.format(m)}</p>
            <div className="grid grid-cols-7 gap-0.5 text-center text-[11px]">
              {WEEKDAYS.map((w) => (
                <span key={w} className="py-0.5 text-[10px] text-muted-foreground">
                  {w}
                </span>
              ))}
              {cells.map((day, i) => {
                if (!day) return <span key={`e${i}`} />;
                const inRange = day >= data.from && day < data.to;
                const isFree = free.has(day);
                return (
                  <span
                    key={day}
                    className={
                      !inRange
                        ? "py-1 text-muted-foreground/30"
                        : isFree
                          ? "rounded bg-sage/30 py-1 font-medium text-sage-deep"
                          : "py-1 text-muted-foreground/50 line-through"
                    }
                  >
                    {Number(day.slice(8))}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-sage/30" /> frei
        </span>
        <span className="flex items-center gap-1">
          <span className="line-through">12</span> belegt
        </span>
        <span>· mind. 2 Nächte</span>
      </p>
    </div>
  );
}

function utc(s: string): Date {
  return new Date(s + "T00:00:00Z");
}
function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function plusDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + n);
  return next;
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
