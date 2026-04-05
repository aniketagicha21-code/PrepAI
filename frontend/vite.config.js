import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const viteApi =
    env.VITE_API_URL || (mode === "production" ? "https://prepai-iru2.onrender.com" : "");
  return {
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(viteApi),
    },
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": "http://127.0.0.1:8000",
        "/health": "http://127.0.0.1:8000",
      },
    },
  };
});
