import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on 0.0.0.0 so other LAN devices can reach the dev server
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
