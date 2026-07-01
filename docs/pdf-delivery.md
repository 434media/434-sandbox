# CMS PDF delivery

The CMS renders PDF pages through the same `buildSlides` components used by the on-screen preview. The server opens an isolated export route in headless Chrome, injects the requested deck data directly into that browser session, waits for fonts and images, and returns a 16:9, 12-page PDF. Deck content is not placed in a URL or temporary server store.

## Environment variables

```env
# Required in deployments where Chrome is not installed at a standard path.
PUPPETEER_EXECUTABLE_PATH=/path/to/chrome

# Required for Email PDF. The sender must be verified by Resend.
RESEND_API_KEY=re_...
DECK_EMAIL_FROM=434 Media <decks@example.com>
```

Local macOS development automatically uses Google Chrome or Chromium from `/Applications` when available. Linux also checks common system Chrome paths. A production image must include a compatible Chrome/Chromium binary and set `PUPPETEER_EXECUTABLE_PATH` when it is installed elsewhere.

Email delivery uses Resend's HTTPS API without hardcoded credentials. Successful sends are logged on the server and recorded in the browser's `cms_email_activity` localStorage collection because this sandbox has no Firestore or shared activity service.
