import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import { initAnalytics } from './lib/analytics';
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});


// Initialize Google Analytics
initAnalytics();

// Load VGS dynamically after page load to prevent blocking
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = 'https://js.verygoodvault.com/vgs-collect/2.18.0/vgs-collect.js';
      script.async = true;
      document.body.appendChild(script);
    }, 2000); // 2 second delay to ensure LCP is finished
  });
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary><App /></ErrorBoundary>
    </HelmetProvider>
    <Toaster />
    <Analytics />
  </StrictMode>,
);
