import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          className: "!bg-nexus-surface !text-nexus-text !border !border-[rgba(0,212,255,0.2)] !font-mono !text-sm",
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
