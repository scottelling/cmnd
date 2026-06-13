import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In production, Vercel serves the static build and routes /api/* to the
// serverless functions under api/. For local dev, run `vercel dev` (which serves
// the functions on :3000) and Vite proxies /api/* to it so chat works locally.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
