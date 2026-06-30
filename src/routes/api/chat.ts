import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/agent/system-prompt";
import { TOOL_DEFINITIONS, runTool } from "@/lib/agent/tools";

const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 1024;
const MAX_TOOL_ITERATIONS = 6;

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { messages?: ClientMessage[] };
        try {
          body = (await request.json()) as { messages?: ClientMessage[] };
        } catch {
          return json({ error: "invalid_json" }, 400);
        }

        const messages = (body.messages ?? []).filter(
          (m): m is ClientMessage =>
            (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
        );
        if (messages.length === 0) {
          return json({ error: "messages required" }, 400);
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          return json({ error: "ANTHROPIC_API_KEY not configured" }, 500);
        }

        const client = new Anthropic({ apiKey });

        // We run the tool-use loop server-side and stream just the final
        // assistant text back as Server-Sent Events. SSE keeps the wire
        // simple — frontend reads `event: token` / `event: done` / `event: error`.
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const send = (event: string, data: string) => {
              controller.enqueue(
                encoder.encode(`event: ${event}\ndata: ${data}\n\n`),
              );
            };

            try {
              // Build the running Anthropic-format message history.
              const apiMessages: Anthropic.MessageParam[] = messages.map((m) => ({
                role: m.role,
                content: m.content,
              }));

              for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
                const response = await client.messages.create({
                  model: MODEL,
                  max_tokens: MAX_TOKENS,
                  system: SYSTEM_PROMPT,
                  tools: TOOL_DEFINITIONS,
                  messages: apiMessages,
                });

                // Stream out any plain-text blocks now.
                for (const block of response.content) {
                  if (block.type === "text") {
                    send("token", JSON.stringify(block.text));
                  }
                }

                // No tool calls? we're done.
                const toolUseBlocks = response.content.filter(
                  (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
                );
                if (toolUseBlocks.length === 0 || response.stop_reason !== "tool_use") {
                  break;
                }

                // Add assistant turn (with tool_use blocks) + tool results
                apiMessages.push({ role: "assistant", content: response.content });

                const toolResults: Anthropic.ToolResultBlockParam[] = [];
                for (const tu of toolUseBlocks) {
                  send("tool", JSON.stringify({ name: tu.name }));
                  const result = await runTool(tu.name, tu.input as Record<string, unknown>);
                  toolResults.push({
                    type: "tool_result",
                    tool_use_id: tu.id,
                    content: result,
                  });
                }
                apiMessages.push({ role: "user", content: toolResults });
              }

              send("done", "{}");
            } catch (e) {
              console.error("[chat] error", e);
              send(
                "error",
                JSON.stringify({
                  message: e instanceof Error ? e.message : "unknown error",
                }),
              );
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "content-type": "text/event-stream; charset=utf-8",
            "cache-control": "no-cache, no-transform",
            "x-accel-buffering": "no",
          },
        });
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
