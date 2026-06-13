// Serverless Anthropic proxy. The browser POSTs the same body the prototype sent
// directly to api.anthropic.com — { model, max_tokens, system, messages, tools } —
// and this function attaches the server-only API key and forwards it. The key
// never reaches the client.
//
// Runs as a Vercel Node serverless function (api/chat.js -> /api/chat).

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });
  }

  // Vercel parses JSON bodies for Node functions; fall back to manual parse.
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: "Invalid JSON body." }); }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Missing request body." });
  }

  const { model, max_tokens, system, messages, tools } = body;
  if (!model || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Body must include `model` and `messages`." });
  }

  // Only forward the fields we expect — never echo arbitrary client input upstream.
  const payload = {
    model,
    max_tokens: max_tokens || 1600,
    messages,
  };
  if (system) payload.system = system;
  if (Array.isArray(tools) && tools.length) payload.tools = tools;

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(payload),
    });

    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return res.status(upstream.status).json(data || { error: "Upstream error" });
    }
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: "Failed to reach the model." });
  }
}
