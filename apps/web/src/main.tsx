import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ToastProvider } from '@/components/Toast';
import { AccessibilityProvider } from '@/hooks/useAccessibility';
import { installClientLogger } from '@/lib/client-logger';
import ErrorBoundary from '@/components/ErrorBoundary';
import './i18n';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
});

// Global xato tutuvchilar — `window.onerror` va `unhandledrejection`.
installClientLogger();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {/* Ko'rinish sozlamalari (shrift, kontrast, rasmlar) — butun sayt uchun */}
          <AccessibilityProvider>
            {/* Admin paneldagi barcha xabarlar shu provayder orqali ko'rsatiladi */}
            <ToastProvider>
              {/* Eng tashqi chegara — marshrutlashdan oldingi xatolar uchun */}
              <ErrorBoundary scope="public">
                <App />
              </ErrorBoundary>
            </ToastProvider>
          </AccessibilityProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
