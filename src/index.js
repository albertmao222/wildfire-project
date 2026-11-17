import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* router goes out here so every component can see the url */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);