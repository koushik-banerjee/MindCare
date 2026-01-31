import React from "react";
import ReactDOM from "react-dom/client";
import { AppRoutes } from "./app/router";
import { Providers } from "./app/providers";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <AppRoutes />
    </Providers>
  </React.StrictMode>
);
