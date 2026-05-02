self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      if (event.request.mode === 'navigate') {
        return Response.redirect(new URL('/', self.location.origin).toString())
      }
      return new Response('', { status: 503, statusText: 'Service Unavailable' })
    })
  )
})
