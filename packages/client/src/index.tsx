import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";

import App from "./App";

import "./index.css";

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.PRI_SENTRY_DSN,
  integrations: [],
  environment: import.meta.env.PRI_SENTRY_ENV,
});

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <>
    <App />
    <Analytics />
  </>
);
