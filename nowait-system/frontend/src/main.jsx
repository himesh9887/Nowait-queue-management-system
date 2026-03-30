import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./index.css";
import App from "./App";
import NotificationCenter from "./components/NotificationCenter";
import { AuthProvider } from "./context/AuthContext";
import { QueueProvider } from "./context/QueueContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <QueueProvider>
        <App />
        <NotificationCenter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3600,
            style: {
              background: "rgba(10, 15, 30, 0.92)",
              color: "#e2e8f0",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              backdropFilter: "blur(16px)",
            },
          }}
        />
      </QueueProvider>
    </AuthProvider>
  </StrictMode>,
);
