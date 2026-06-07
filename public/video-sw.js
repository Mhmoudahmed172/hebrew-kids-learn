// Service Worker لإخفاء الرابط الأصلي للفيديو مع دعم Range requests (بث سريع)
const urlMap = new Map(); // token -> realUrl

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("message", (event) => {
  const { type, token, url } = event.data || {};
  if (type === "REGISTER" && token && url) {
    urlMap.set(token, url);
    event.ports[0]?.postMessage({ ok: true });
  } else if (type === "UNREGISTER" && token) {
    urlMap.delete(token);
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith("/__video/")) return;
  const token = url.pathname.replace("/__video/", "");
  const realUrl = urlMap.get(token);
  if (!realUrl) {
    event.respondWith(new Response("Not found", { status: 404 }));
    return;
  }
  // مرّر طلب المتصفح (مع Range) للرابط الحقيقي — يحافظ على البث الجزئي السريع
  const headers = new Headers();
  const range = event.request.headers.get("range");
  if (range) headers.set("range", range);
  event.respondWith(
    fetch(realUrl, {
      headers,
      method: "GET",
      mode: "cors",
      credentials: "omit",
    }).then((res) => {
      // أعد نفس الاستجابة (تتضمن 206 Partial Content عند وجود Range)
      const respHeaders = new Headers(res.headers);
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: respHeaders,
      });
    })
  );
});
