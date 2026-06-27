import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type VisitPayload = {
  path?: string;
  referrer?: string;
  language?: string;
  sessionId?: string;
};

export const Route = createFileRoute("/api/track-visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: VisitPayload;
        try {
          payload = (await request.json()) as VisitPayload;
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const path = cleanPath(payload.path);
        if (!path || path.startsWith("/admin") || path.startsWith("/api")) {
          return json({ ok: true, ignored: true }, 202);
        }

        const admin = getSupabaseAdmin();
        const { error } = await admin.from("page_visits").insert({
          path,
          referrer: cleanText(payload.referrer, 500),
          language: cleanText(payload.language, 40),
          session_id: cleanText(payload.sessionId, 80),
          user_agent: cleanText(request.headers.get("user-agent"), 500),
        });

        if (error) {
          console.error("[analytics] insert failed", error);
          return json({ ok: false, error: "insert_failed" }, 500);
        }

        return json({ ok: true });
      },
    },
  },
});

function cleanPath(path: string | undefined): string | null {
  if (!path) return null;
  const value = path.trim().slice(0, 300);
  return value.startsWith("/") ? value : `/${value}`;
}

function cleanText(value: string | null | undefined, max: number): string | null {
  const text = value?.trim();
  return text ? text.slice(0, max) : null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
