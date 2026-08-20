import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";
import { componentTagger } from "lovable-tagger";

// Resolved from this file's own URL — works in ESM without `__dirname`
// and without assuming the process CWD.
const srcDir = fileURLToPath(new URL("./src", import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Root-relative asset URLs: correct on Vercel, Netlify, Cloudflare Pages
  // and `vite preview`, and safe for nested routes such as /mentor/:id.
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    host: true,
    port: 4173,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": srcDir,
    },
  },
  build: {
    sourcemap: false,
    // Split heavy third-party code into long-lived, separately cached chunks
    // so the first paint only downloads what the landing page needs.
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router")) return "router";
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("react-markdown") || id.includes("remark") || id.includes("micromark") || id.includes("mdast") || id.includes("unist")) return "markdown";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
}));
