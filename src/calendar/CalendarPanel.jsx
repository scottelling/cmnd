import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import { SANS, HUMAN, MONO, EVENT_COLORS } from "../design/tokens.js";
import { dateKey, time12, prettyDay } from "../lib/time.js";
import { nextBid } from "../lib/artifacts.js";
import { IconBtn } from "../ui/IconBtn.jsx";

const HOUR_H = 54;
const DAY_START_HOUR = 6;

export function CalendarPanel({ events, onUpdate, date, setDate, accent, t }) {
  const key = dateKey(date);
  const dayEvents = useMemo(() => events.filter(e => e.date === key).sort((a, b) => a.start - b.start), [events, key]);
  const [editing, setEditing] = useState(null);
  const [evDrag, setEvDrag] = useState(null);
  const scrollRef = useRef(null);
  const isToday = key === dateKey(new Date());
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, (8 - DAY_START_HOUR) * HOUR_H - 20); }, [key]);

  const shiftDay = (d) => { const n = new Date(date); n.setDate(date.getDate() + d); setDate(n); };
  const hours = []; for (let h = DAY_START_HOUR; h <= 23; h++) hours.push(h);
  const topOf = (m) => (m - DAY_START_HOUR * 60) / 60 * HOUR_H;
  const openNew = (hour) => setEditing({ id: null, date: key, start: hour * 60, end: hour * 60 + 60, title: "", color: EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)] });
  const save = () => { const ev = editing; if (!ev.title.trim()) { setEditing(null); return; } if (ev.id) onUpdate(list => list.map(x => x.id === ev.id ? ev : x)); else onUpdate(list => [...list, { ...ev, id: nextBid("ev") }]); setEditing(null); };
  const remove = () => { if (editing && editing.id) onUpdate(list => list.filter(x => x.id !== editing.id)); setEditing(null); };

  const onEvDown = (ev, e) => { e.stopPropagation(); if (e.currentTarget.setPointerCapture) try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) { /* noop */ } setEvDrag({ id: ev.id, startY: e.clientY, origStart: ev.start, dur: ev.end - ev.start, dy: 0, moved: false }); };
  const onEvMove = (e) => { setEvDrag(d => { if (!d) return d; const dy = e.clientY - d.startY; return { ...d, dy, moved: d.moved || Math.abs(dy) > 4 }; }); };
  const onEvUp = (ev) => { setEvDrag(d => { if (!d) return null; if (d.moved) { const deltaMin = Math.round((d.dy / HOUR_H) * 60 / 15) * 15; let ns = Math.max(0, Math.min(24 * 60 - d.dur, d.origStart + deltaMin)); onUpdate(list => list.map(x => x.id === d.id ? { ...x, start: ns, end: ns + d.dur } : x)); } else { setEditing({ ...ev }); } return null; }); };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.01em" }}>{prettyDay(date)}</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: t.textMute, marginTop: 1 }}>{date.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
        {!isToday && <button onClick={() => setDate(new Date())} style={{ height: 30, padding: "0 13px", borderRadius: 999, border: "none", background: `${accent}1f`, color: accent, fontFamily: MONO, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Today</button>}
        <IconBtn t={t} onClick={() => shiftDay(-1)} title="Previous day"><ChevronLeft size={18} /></IconBtn>
        <IconBtn t={t} onClick={() => shiftDay(1)} title="Next day"><ChevronRight size={18} /></IconBtn>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", minHeight: 0, position: "relative", marginTop: 2 }}>
        <div style={{ position: "relative", height: (24 - DAY_START_HOUR) * HOUR_H }}>
          {hours.map(h => (
            <div key={h} onClick={() => openNew(h)} style={{ position: "absolute", top: topOf(h * 60), left: 0, right: 0, height: HOUR_H, cursor: "pointer" }}>
              <span style={{ position: "absolute", top: -6, left: 0, width: 46, fontFamily: MONO, fontSize: 10, color: t.textFaint, textAlign: "right", paddingRight: 10 }}>{time12(h * 60).replace(":00", "")}</span>
            </div>
          ))}
          {isToday && nowMins >= DAY_START_HOUR * 60 && (
            <div style={{ position: "absolute", top: topOf(nowMins), left: 50, right: 4, height: 0, zIndex: 3, display: "flex", alignItems: "center" }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: t.danger, marginLeft: -4, flexShrink: 0 }} />
              <span style={{ flex: 1, height: 2, background: t.danger, borderRadius: 2 }} />
            </div>
          )}
          {dayEvents.map(ev => {
            const dragging = evDrag && evDrag.id === ev.id;
            const top = topOf(ev.start) + (dragging ? evDrag.dy : 0);
            const h = Math.max(24, (ev.end - ev.start) / 60 * HOUR_H - 3);
            return (
              <button key={ev.id} onPointerDown={(e) => onEvDown(ev, e)} onPointerMove={onEvMove} onPointerUp={() => onEvUp(ev)} onPointerCancel={() => onEvUp(ev)}
                style={{ position: "absolute", top, left: 54, right: 6, height: h, borderRadius: 11, border: "none", cursor: dragging ? "grabbing" : "grab", textAlign: "left", padding: "6px 10px", overflow: "hidden", background: dragging ? `${ev.color}3a` : `${ev.color}26`, display: "flex", flexDirection: "column", gap: 1, touchAction: "none", boxShadow: dragging ? t.shadow : "none", zIndex: dragging ? 5 : 1, transition: dragging ? "none" : "box-shadow 140ms" }}>
                <span style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, borderRadius: 999, background: ev.color }} />
                <span style={{ fontFamily: HUMAN, fontSize: 13, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingLeft: 4 }}>{ev.title}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: t.textMute, paddingLeft: 4 }}>{time12(dragging ? Math.max(0, Math.min(24 * 60 - evDrag.dur, evDrag.origStart + Math.round((evDrag.dy / HOUR_H) * 60 / 15) * 15)) : ev.start)} – {time12((dragging ? Math.max(0, Math.min(24 * 60 - evDrag.dur, evDrag.origStart + Math.round((evDrag.dy / HOUR_H) * 60 / 15) * 15)) : ev.start) + (ev.end - ev.start))}</span>
              </button>
            );
          })}
        </div>
      </div>
      <button onClick={() => openNew(Math.max(DAY_START_HOUR, Math.min(22, new Date().getHours())))} style={{ position: "absolute", bottom: 6, right: 6, width: 46, height: 46, borderRadius: 999, border: "none", cursor: "pointer", background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: t.shadow, zIndex: 4 }}>
        <Plus size={23} strokeWidth={2.4} color="#fff" />
      </button>
      {editing && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, background: t.surface, borderRadius: 12, display: "flex", flexDirection: "column", boxShadow: t.shadow }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px" }}>
            <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: t.text }}>{editing.id ? "Edit event" : "New event"}</span>
            <IconBtn t={t} onClick={() => setEditing(null)} title="Close"><X size={18} /></IconBtn>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Event title" autoFocus
              style={{ width: "100%", padding: "11px 13px", borderRadius: 11, border: "none", background: t.surface2, color: t.text, fontFamily: HUMAN, fontSize: 16, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              {[["Start", "start"], ["End", "end"]].map(([lbl, fld]) => (
                <div key={fld} style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: t.textMute, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{lbl}</div>
                  <select value={editing[fld]} onChange={(e) => setEditing({ ...editing, [fld]: parseInt(e.target.value, 10) })}
                    style={{ width: "100%", padding: "10px 11px", borderRadius: 11, border: "none", background: t.surface2, color: t.text, fontFamily: MONO, fontSize: 16, outline: "none" }}>
                    {Array.from({ length: 48 }, (_, i) => i * 30).map(m => <option key={m} value={m}>{time12(m)}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: t.textMute, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Color</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {EVENT_COLORS.map(c => (
                <button key={c} onClick={() => setEditing({ ...editing, color: c })} style={{ width: 30, height: 30, borderRadius: 999, border: "none", background: c, cursor: "pointer", boxShadow: editing.color === c ? `0 0 0 3px ${t.surface}, 0 0 0 5px ${c}` : "none" }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} style={{ flex: 1, padding: "12px", borderRadius: 11, border: "none", background: accent, color: "#fff", fontFamily: SANS, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Save</button>
              {editing.id && <button onClick={remove} style={{ padding: "12px 16px", borderRadius: 11, border: "none", background: `${t.danger}1f`, color: t.danger, fontFamily: SANS, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Delete</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPanel;
