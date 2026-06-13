import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import "./index.css";

// StrictMode intentionally omitted: the workspace relies on pointer-capture drag
// handlers and global listeners whose dev-only double-invocation adds noise during
// manual testing. Production behavior is unaffected.
createRoot(document.getElementById("root")).render(<App />);
