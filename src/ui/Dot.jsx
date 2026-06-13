export const Dot = ({ color, size = 6, pulse }) => (
  <span style={{ width: size, height: size, borderRadius: 999, background: color, display: "inline-block", flexShrink: 0, animation: pulse ? "cmnd-pulse 1.6s ease-out infinite" : "none" }} />
);

export default Dot;
