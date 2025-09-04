const CACHE_NAME = 'fire-dept-organizer-cache-v32';
const urlsToCache = [
  './',
  './index.html',
  './favicon.svg',
  './index.js',
  './App.js',
  './types.js',
  './metadata.json',
  './components/icons.js',
  './components/ScheduleDisplay.js',
  './components/AssignmentCard.js',
  './components/TimeGroupedScheduleDisplay.js',
  './components/Nomenclador.js',
  './components/HelpModal.js',
  './components/ServiceTemplateModal.js',
  './components/ExportTemplateModal.js',
  './components/UnitReportDisplay.js',
  './components/UnitStatusView.js',
  './components/CommandPostView.js',
  './components/EraReportDisplay.js',
  './components/GeneratorReportDisplay.js',
  './components/Croquis.js',
  './components/MaterialsDisplay.js',
  './components/MaterialStatusView.js',
  './services/geminiService.js',
  './services/exportService.js',
  './services/wordImportService.js',
  './data/scheduleData.js',
  './data/rosterData.js',
  './data/commandPersonnelData.js',
  './data/servicePersonnelData.js',
  './data/unitData.js',
  './data/serviceTemplates.js',
  './data/unitReportData.js',
  './data/eraData.js',
  './data/generatorData.js',
  './data/materialsData.js',
  './data/streets.js',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/docx@8.5.0',
  'https://esm.sh/xlsx@0.18.5',
  'https://esm.sh/mammoth@1.8.0',
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/react-dom@^19.1.1/client',
  'https://esm.sh/jspdf@2.5.1',
  'https://esm.sh/jspdf-autotable@3.8.2',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching app shell');
      return cache.addAll(urlsToCache).catch(err => {
          console.error('Failed to cache some resources:', err);
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For requests to esm.sh, unpkg, or cdnjs try network first, then cache.
  if (event.request.url.startsWith('https://esm.sh/') || event.request.url.startsWith('https://unpkg.com/') || event.request.url.startsWith('https://cdnjs.cloudflare.com/')) {
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        if (networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // For all other requests, use cache-first strategy.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
           return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});