// Date/time helpers for the calendar and day view.

export const pad2 = (n) => String(n).padStart(2, "0");

export const dateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const time12 = (mins) => { let h = Math.floor(mins / 60); const m = mins % 60; const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${pad2(m)} ${ap}`; };

export const prettyDay = (d) => {
  const t = new Date(); const y = new Date(); y.setDate(t.getDate() - 1); const n = new Date(); n.setDate(t.getDate() + 1);
  if (dateKey(d) === dateKey(t)) return "Today";
  if (dateKey(d) === dateKey(y)) return "Yesterday";
  if (dateKey(d) === dateKey(n)) return "Tomorrow";
  return d.toLocaleDateString("en", { weekday: "long" });
};
