import "./polyfills";


import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "./utils/web3auth";
import "./index.css";



ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
  <Web3AuthProvider config={web3AuthContextConfig}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Web3AuthProvider>
</BrowserRouter>
  </React.StrictMode>
);