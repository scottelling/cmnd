// buildSrcDoc(code, mode, theme) -> a complete HTML string for an isolated
// <iframe sandbox="allow-scripts" srcdoc={...}>. Never run AI code in the parent.
//
// The bridge (console + error + storage) is injected into every mode. React mode
// additionally lazy-loads only the CDN libraries the code actually imports,
// rewrites ES imports to allow-listed UMD globals, Babel-transforms JSX, and
// mounts the default export inside an ErrorBoundary.

const CDN = {
  "react": "https://unpkg.com/react@18/umd/react.production.min.js",
  "react-dom": "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "prop-types": "https://unpkg.com/prop-types@15/prop-types.min.js",
  "recharts": "https://unpkg.com/recharts@2/umd/Recharts.min.js",
  "lodash": "https://unpkg.com/lodash@4/lodash.min.js",
  "d3": "https://unpkg.com/d3@7/dist/d3.min.js",
  "three": "https://unpkg.com/three@0.150.1/build/three.min.js",
  "lucide-react": "https://unpkg.com/lucide-react@0.292.0/dist/umd/lucide-react.min.js",
  "papaparse": "https://unpkg.com/papaparse@5/papaparse.min.js",
  "xlsx": "https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js",
  "tone": "https://unpkg.com/tone@14/build/Tone.js",
  "mathjs": "https://unpkg.com/mathjs@12/lib/browser/math.js",
  "chart.js": "https://unpkg.com/chart.js@4/dist/chart.umd.js",
};
const BABEL = "https://unpkg.com/@babel/standalone@7/babel.min.js";
const TAILWIND = "https://cdn.tailwindcss.com";

// map import specifier -> UMD global name (kept in sync inside the bootstrap)
const ALLOW = ["react", "react-dom", "recharts", "lodash", "d3", "three", "lucide-react", "papaparse", "xlsx", "tone", "mathjs", "chart.js"];

const importedModules = (code) => {
  const found = new Set();
  const re = /import\s+[^'"]*from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(code)) !== null) if (ALLOW.includes(m[1])) found.add(m[1]);
  return found;
};

// Make a string safe to embed inside an inline <script> as a JS string literal.
const jsString = (s) => JSON.stringify(String(s)).replace(/<\/(script)/gi, "<\\/$1").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

// ---- the bridge: console relay + error capture + storage proxy (all modes) ----
const BRIDGE = `
(function(){
  function send(msg){ try { parent.postMessage(msg, '*'); } catch (e) {} }
  window.__sandboxSend = send;
  ['log','info','warn','error','debug'].forEach(function(level){
    var orig = console[level];
    console[level] = function(){
      try {
        var args = Array.prototype.map.call(arguments, function(v){
          if (typeof v === 'string') return v;
          try { return JSON.stringify(v); } catch (e) { return String(v); }
        });
        send({ type:'sandbox-console', level: level, text: args.join(' ') });
      } catch (e) {}
      if (orig) orig.apply(console, arguments);
    };
  });
  window.onerror = function(message, src, line, col, error){
    send({ type:'sandbox-error', phase:'runtime', message: String(message), stack: (error && error.stack) || '' });
    return false;
  };
  window.onunhandledrejection = function(ev){
    var r = ev && ev.reason;
    send({ type:'sandbox-error', phase:'runtime', message: (r && r.message) || String(r), stack: (r && r.stack) || '' });
  };
  // storage proxy -> parent (request-id matched, Promise-based)
  var pending = {}, sid = 0;
  function call(op, key, value, shared){
    return new Promise(function(resolve, reject){
      var id = 's' + (++sid);
      pending[id] = { resolve: resolve, reject: reject };
      send({ type:'storage-req', id: id, op: op, key: key, value: value, shared: !!shared });
    });
  }
  window.storage = {
    get: function(key, shared){ return call('get', key, undefined, shared); },
    set: function(key, value, shared){ return call('set', key, value, shared); },
    delete: function(key, shared){ return call('delete', key, undefined, shared); },
    list: function(prefix, shared){ return call('list', prefix, undefined, shared); }
  };
  window.addEventListener('message', function(ev){
    var d = ev.data; if (!d || d.type !== 'storage-res') return;
    var p = pending[d.id]; if (!p) return; delete pending[d.id];
    if (d.error) p.reject(new Error(d.error)); else p.resolve(d.result);
  });
})();
`;

// ---- React bootstrap: import rewrite + transpile + mount (react mode only) ----
const REACT_BOOTSTRAP = (userCodeLiteral) => `
(function(){
  var send = window.__sandboxSend;
  var USERCODE = ${userCodeLiteral};
  var REG = { 'react':'React','react-dom':'ReactDOM','recharts':'Recharts','lodash':'_','d3':'d3','three':'THREE','lucide-react':'LucideReact','papaparse':'Papa','xlsx':'XLSX','tone':'Tone','mathjs':'math','chart.js':'Chart' };
  function __require(name){
    var g = REG[name];
    if (g && window[g]) return window[g];
    throw new Error('Import "' + name + '" is not in the sandbox allow-list.');
  }
  function rewriteImport(clause, mod){
    var parts = [], req = '__require(' + JSON.stringify(mod) + ')';
    var nsM = clause.match(/^\\*\\s+as\\s+([A-Za-z0-9_$]+)$/);
    if (nsM) { parts.push('var ' + nsM[1] + ' = ' + req + ';'); return parts.join('\\n'); }
    var braceM = clause.match(/\\{([^}]*)\\}/);
    var named = braceM ? braceM[1].trim() : null;
    var def = clause.replace(/\\{[^}]*\\}/, '').replace(/,/g, ' ').trim();
    if (def) parts.push('var ' + def + ' = (' + req + ').default || ' + req + ';');
    if (named) {
      var mapped = named.split(',').map(function(s){ s = s.trim(); if (!s) return null; var as = s.split(/\\s+as\\s+/); return as.length === 2 ? (as[1].trim() + ': ' + as[0].trim()) : s; }).filter(Boolean).join(', ');
      if (mapped) parts.push('var { ' + mapped + ' } = ' + req + ';');
    }
    return parts.join('\\n');
  }
  function prepare(src){
    var lines = src.split('\\n'), out = [];
    for (var i = 0; i < lines.length; i++){
      var line = lines[i];
      var im = line.match(/^\\s*import\\s+(.+?)\\s+from\\s+['"]([^'"]+)['"];?\\s*$/);
      if (im) { out.push(rewriteImport(im[1].trim(), im[2])); continue; }
      if (/^\\s*import\\s+['"][^'"]+['"];?\\s*$/.test(line)) { continue; } // side-effect import (e.g. css)
      out.push(line);
    }
    var joined = out.join('\\n');
    var defName = null;
    joined = joined.replace(/export\\s+default\\s+function\\s+([A-Za-z0-9_$]+)/, function(_m, n){ defName = n; return 'function ' + n; });
    joined = joined.replace(/export\\s+default\\s+class\\s+([A-Za-z0-9_$]+)/, function(_m, n){ defName = n; return 'class ' + n; });
    if (defName) joined += '\\n;__SANDBOX_DEFAULT__ = ' + defName + ';';
    joined = joined.replace(/export\\s+default\\s+/, '__SANDBOX_DEFAULT__ = ');
    joined = joined.replace(/export\\s+(const|let|var|function|class)\\s/g, '$1 ');
    joined = joined.replace(/export\\s*\\{[^}]*\\}\\s*;?/g, '');
    return 'var __SANDBOX_DEFAULT__;\\n' + joined;
  }
  function makeBoundary(React){
    return class EB extends React.Component {
      constructor(p){ super(p); this.state = { err: null }; }
      static getDerivedStateFromError(e){ return { err: e }; }
      componentDidCatch(e){ send({ type:'sandbox-error', phase:'runtime', message: (e && e.message) || String(e), stack: (e && e.stack) || '' }); }
      render(){ if (this.state.err) return React.createElement('div', { style: { padding: 16, fontFamily: 'monospace', color: '#FF5252', whiteSpace: 'pre-wrap' } }, 'Runtime error: ' + ((this.state.err && this.state.err.message) || this.state.err)); return this.props.children; }
    };
  }
  function boot(){
    var root = document.getElementById('root');
    var transformed;
    try {
      var prepared = prepare(USERCODE);
      transformed = Babel.transform(prepared, { presets: ['react'], filename: 'sandbox.jsx' }).code;
    } catch (err) {
      return send({ type:'sandbox-error', phase:'transpile', message: (err && err.message) || String(err), stack: (err && err.stack) || '' });
    }
    try {
      var factory = new Function('React', 'ReactDOM', '__require', transformed + '\\nreturn __SANDBOX_DEFAULT__;');
      var Comp = factory(window.React, window.ReactDOM, __require);
      if (!Comp) throw new Error('No default export found — add "export default" to your component.');
      var EB = makeBoundary(window.React);
      var element = (typeof Comp === 'function') ? window.React.createElement(Comp) : Comp;
      var tree = window.React.createElement(EB, null, element);
      if (window.ReactDOM.createRoot) window.ReactDOM.createRoot(root).render(tree);
      else window.ReactDOM.render(tree, root);
      send({ type:'sandbox-ready' });
    } catch (err) {
      send({ type:'sandbox-error', phase:'runtime', message: (err && err.message) || String(err), stack: (err && err.stack) || '' });
    }
  }
  if (!window.React || !window.ReactDOM || !window.Babel) {
    send({ type:'sandbox-error', phase:'transpile', message: 'Core libraries failed to load from CDN (check your connection / allow-list).', stack: '' });
    return;
  }
  boot();
})();
`;

const baseStyle = (theme) => `
  html,body { margin:0; padding:0; background:${theme.bg}; color:${theme.text}; }
  body { font-family: ${"'Outfit',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}; }
  #root { min-height: 100vh; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.4); border-radius: 8px; }
`;

// minimal, dependency-free Markdown -> HTML (headings, emphasis, code, lists, links, hr, quotes)
const mdToHtml = (md) => {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const inline = (s) => esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const out = blocks.map((b) => {
    if (/^```/.test(b)) { const body = b.replace(/^```[\w-]*\n?/, "").replace(/```$/, ""); return "<pre><code>" + esc(body) + "</code></pre>"; }
    const h = b.match(/^(#{1,6})\s+(.*)$/);
    if (h) return "<h" + h[1].length + ">" + inline(h[2]) + "</h" + h[1].length + ">";
    if (/^\s*([-*]|\d+\.)\s+/.test(b)) {
      const ordered = /^\s*\d+\./.test(b);
      const items = b.split("\n").map((l) => l.replace(/^\s*([-*]|\d+\.)\s+/, "")).filter(Boolean).map((l) => "<li>" + inline(l) + "</li>").join("");
      return ordered ? "<ol>" + items + "</ol>" : "<ul>" + items + "</ul>";
    }
    if (/^>\s?/.test(b)) return "<blockquote>" + inline(b.replace(/^>\s?/gm, "")) + "</blockquote>";
    if (/^(-{3,}|\*{3,})$/.test(b.trim())) return "<hr/>";
    return "<p>" + inline(b) + "</p>";
  });
  return out.join("\n");
};

export function buildSrcDoc(code, mode, theme) {
  const m = mode || "react";

  if (m === "react") {
    const mods = importedModules(code);
    mods.add("react"); mods.add("react-dom");
    if (mods.has("recharts")) mods.add("prop-types");
    const order = ["react", "react-dom", "prop-types", "recharts", "lodash", "d3", "three", "lucide-react", "papaparse", "xlsx", "tone", "mathjs", "chart.js"];
    const scripts = order.filter((k) => mods.has(k) && CDN[k]).map((k) => `<script src="${CDN[k]}" crossorigin></script>`).join("\n");
    return `<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<script src="${TAILWIND}"></script>
${scripts}
<script src="${BABEL}" crossorigin></script>
<style>${baseStyle(theme)}</style>
</head><body>
<div id="root"></div>
<script>${BRIDGE}</script>
<script>${REACT_BOOTSTRAP(jsString(code))}</script>
</body></html>`;
  }

  if (m === "html") {
    return `<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<script src="${TAILWIND}"></script>
<style>${baseStyle(theme)}</style>
</head><body>
<script>${BRIDGE}</script>
${code}
</body></html>`;
  }

  if (m === "svg") {
    return `<!doctype html><html><head><meta charset="utf-8"/>
<style>${baseStyle(theme)} body{display:flex;align-items:center;justify-content:center;min-height:100vh}</style>
</head><body>
<script>${BRIDGE}</script>
${code}
</body></html>`;
  }

  if (m === "markdown") {
    const html = mdToHtml(code);
    return `<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>${baseStyle(theme)}
  #root{max-width:740px;margin:0 auto;padding:28px 22px;line-height:1.6}
  #root h1,#root h2,#root h3{line-height:1.25;margin:1.2em 0 .5em}
  #root a{color:${theme.accent}}
  #root code{font-family:'Fira Code',monospace;background:${theme.surfaceAlt};padding:2px 6px;border-radius:6px;font-size:.9em}
  #root pre{background:${theme.surfaceAlt};padding:14px;border-radius:10px;overflow:auto}
  #root pre code{background:none;padding:0}
  #root blockquote{margin:1em 0;padding-left:14px;border-left:3px solid ${theme.accent};color:${theme.textDim}}
  #root hr{border:none;height:1px;background:${theme.border}}
</style>
</head><body>
<script>${BRIDGE}</script>
<div id="root">${html}</div>
</body></html>`;
  }

  return buildSrcDoc(code, "react", theme);
}

export default buildSrcDoc;
