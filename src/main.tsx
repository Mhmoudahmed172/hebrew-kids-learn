import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Env sanity check (dev only)
if (import.meta.env.DEV) {
  const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;
  const missing = required.filter((k) => !import.meta.env[k]);
  if (missing.length) {
    console.warn(`[env] Missing environment variables: ${missing.join(", ")}`);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
