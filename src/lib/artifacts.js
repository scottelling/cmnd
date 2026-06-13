// Chat artifact protocol — the <artifact …> tag format the model emits, and the
// round-trip between thread blocks and Anthropic message content.
//
// Block shapes:
//   { type:'message', role:'user'|'assistant', text }
//   { type:'artifact', artifact:'table'|'code'|'decision'|'tasklist', title, … }
//   { type:'agent', title, detail }   (web-search status line)

let _bid = 0;
export const nextBid = (p = "b") => `${p}_${Date.now()}_${++_bid}`;

const escAttr = (s) => String(s).replace(/"/g, "&quot;");

const serializeArtifact = (b) => {
  if (b.artifact === "table") return `<artifact type="table" title="${escAttr(b.title)}">${JSON.stringify(b.data)}</artifact>`;
  if (b.artifact === "code") return `<artifact type="code" title="${escAttr(b.title)}" language="${escAttr(b.language || "text")}">${JSON.stringify({ code: b.code })}</artifact>`;
  if (b.artifact === "decision") return `<artifact type="decision" title="${escAttr(b.title)}">${JSON.stringify({ options: b.options })}</artifact>`;
  if (b.artifact === "tasklist") return `<artifact type="tasklist" title="${escAttr(b.title)}">${JSON.stringify({ groups: b.groups })}</artifact>`;
  return "";
};

export const blocksToMessages = (blocks) => {
  const out = [];
  for (const b of blocks) {
    let role, content;
    if (b.type === "message") { role = b.role === "user" ? "user" : "assistant"; content = b.text; }
    else if (b.type === "artifact") { role = "assistant"; content = serializeArtifact(b); }
    else continue;
    if (!content) continue;
    if (out.length && out[out.length - 1].role === role) out[out.length - 1].content += "\n\n" + content;
    else out.push({ role, content });
  }
  return out;
};

const parseAttrs = (str) => { const a = {}; const re = /(\w+)\s*=\s*"([^"]*)"/g; let m; while ((m = re.exec(str)) !== null) a[m[1]] = m[2]; return a; };

const buildArtifactBlock = (attrs, json) => {
  const id = nextBid();
  if (attrs.type === "table" && json.columns && json.rows) return { id, type: "artifact", artifact: "table", title: attrs.title || "Table", data: { columns: json.columns, rows: json.rows } };
  if (attrs.type === "code" && typeof json.code === "string") return { id, type: "artifact", artifact: "code", title: attrs.title || "Code", language: attrs.language || "text", code: json.code };
  if (attrs.type === "decision" && Array.isArray(json.options)) return { id, type: "artifact", artifact: "decision", title: attrs.title || "Decision", options: json.options };
  if (attrs.type === "tasklist" && Array.isArray(json.groups)) return { id, type: "artifact", artifact: "tasklist", title: attrs.title || "Tasks", groups: json.groups };
  return null;
};

const parseTextForBlocks = (text) => {
  const blocks = []; const re = /<artifact\s+([^>]+)>\s*([\s\S]*?)\s*<\/artifact>/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    const pre = text.slice(last, m.index).trim();
    if (pre) blocks.push({ id: nextBid(), type: "message", role: "assistant", text: pre });
    const attrs = parseAttrs(m[1]); const body = m[2].trim();
    let json = null;
    try { json = JSON.parse(body); } catch (e) { json = null; }
    const built = json ? buildArtifactBlock(attrs, json) : null;
    if (built) blocks.push(built);
    else blocks.push({ id: nextBid(), type: "artifact", artifact: "code", title: attrs.title || "artifact", language: "json", code: body });
    last = m.index + m[0].length;
  }
  const tail = text.slice(last).trim();
  if (tail) blocks.push({ id: nextBid(), type: "message", role: "assistant", text: tail });
  if (!blocks.length && text.trim()) blocks.push({ id: nextBid(), type: "message", role: "assistant", text: text.trim() });
  return blocks;
};

export const parseApiResponse = (data) => {
  const out = []; if (!data || !Array.isArray(data.content)) return out;
  const searches = {};
  for (const item of data.content) {
    const isSearch = (item.type === "server_tool_use" || item.type === "tool_use") && item.name === "web_search";
    if (isSearch) {
      const q = (item.input && item.input.query) || "…";
      const ab = { id: nextBid("agent"), type: "agent", title: "Web search", detail: `Searching “${q}”`, _q: q };
      searches[item.id] = ab; out.push(ab);
    } else if (item.type === "web_search_tool_result") {
      const match = searches[item.tool_use_id];
      if (match) { const rs = Array.isArray(item.content) ? item.content : []; match.detail = `Searched “${match._q}” · ${rs.length} result${rs.length === 1 ? "" : "s"}`; }
    } else if (item.type === "text" && typeof item.text === "string") {
      out.push(...parseTextForBlocks(item.text));
    }
  }
  return out;
};
