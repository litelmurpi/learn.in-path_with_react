import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Skip service worker registration untuk sementara
// if (import.meta.env.PROD) {
//   registerServiceWorker();
// }

// Remove loading screen
const loadingElement = document.getElementById("app-loading");
if (loadingElement) {
  loadingElement.style.display = "none";
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
