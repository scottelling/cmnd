// 32px icon button — 44px min touch target is honored by the larger tap controls;
// this is the compact header/action variant. Depth via hover fill, no border.
export const IconBtn = ({ children, onClick, title, active, t, danger }) => (
  <button onClick={onClick} title={title} style={{ width: 32, height: 32, borderRadius: 9, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: danger ? t.danger : active ? t.accent : t.textMute, transition: "color 160ms, background 160ms" }}
    onMouseEnter={(e) => { if (!active && !danger) e.currentTarget.style.color = t.text; e.currentTarget.style.background = t.hover; }}
    onMouseLeave={(e) => { if (!active && !danger) e.currentTarget.style.color = t.textMute; e.currentTarget.style.background = "transparent"; }}>
    {children}
  </button>
);

export default IconBtn;
