import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Vercel Analytics
import { inject } from '@vercel/analytics';
inject();

// Register Service Worker for PWA (with Safari compatibility)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        // Silently fail for Safari compatibility
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
