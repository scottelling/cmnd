import { useCallback, useEffect, useRef } from "react";

// Nuclear scroll/selection lock during a bullet drag: an injected <style> kills
// overflow/overscroll/touch-action/user-select page-wide, plus a full-screen
// overlay that swallows stray pointer/scroll while the drag is live.
export const useDragLock = () => {
  const sRef = useRef(null), oRef = useRef(null);
  const lock = useCallback(() => {
    const s = document.createElement("style");
    s.textContent = "html,body{overflow:hidden!important;overscroll-behavior:none!important;touch-action:none!important;-webkit-user-select:none!important;user-select:none!important}";
    document.head.appendChild(s); sRef.current = s;
    const o = document.createElement("div");
    o.style.cssText = "position:fixed;inset:0;z-index:9998;touch-action:none;user-select:none;cursor:grabbing";
    document.body.appendChild(o); oRef.current = o;
  }, []);
  const unlock = useCallback(() => {
    if (sRef.current) { sRef.current.remove(); sRef.current = null; }
    if (oRef.current) { oRef.current.remove(); oRef.current = null; }
  }, []);
  useEffect(() => () => unlock(), [unlock]);
  return [lock, unlock];
};

export default useDragLock;
