// Service worker mínimo: permite instalar o site como app ("Baixar site").
// Não guarda nada em cache de propósito, para os dados da fila nunca ficarem velhos.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
