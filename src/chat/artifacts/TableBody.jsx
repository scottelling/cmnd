import { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { MONO } from "../../design/tokens.js";

export function TableBody({ block, t }) {
  const cols = (block.data && block.data.columns) || [], rows = (block.data && block.data.rows) || [];
  const [sortKey, setSortKey] = useState(null); const [asc, setAsc] = useState(false);
  const sorted = useMemo(() => { if (!sortKey) return rows; const out = [...rows].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; if (typeof av === "number") return asc ? av - bv : bv - av; return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av)); }); return out; }, [rows, sortKey, asc]);
  const onSort = (k) => { if (sortKey === k) setAsc(a => !a); else { setSortKey(k); setAsc(false); } };
  const fmt = (c, v) => `${c.prefix || ""}${typeof v === "number" ? v.toLocaleString() : v}${c.suffix || ""}`;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: 12.5 }}>
        <thead><tr>{cols.map(c => (
          <th key={c.key} onClick={() => onSort(c.key)} style={{ textAlign: c.align || "left", padding: "8px 10px", cursor: "pointer", color: sortKey === c.key ? t.text : t.textMute, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: 10, whiteSpace: "nowrap", userSelect: "none" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>{c.label}{sortKey === c.key && (asc ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}</span>
          </th>
        ))}</tr></thead>
        <tbody>{sorted.map((r, i) => <tr key={i} style={{ background: i % 2 ? t.hover : "transparent" }}>{cols.map((c, j) => (
          <td key={c.key} style={{ textAlign: c.align || "left", padding: "8px 10px", color: j === 0 ? t.text : t.textDim, fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap" }}>{fmt(c, r[c.key])}</td>
        ))}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default TableBody;
