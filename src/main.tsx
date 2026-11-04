import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline capability & PWA installability
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New version ready to update');
  },
  onOfflineReady() {
    console.log('[PWA] Ecopulse offline capabilities active');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
