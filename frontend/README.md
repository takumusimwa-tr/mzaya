# Mzaya — Frontend

The Mzaya PWA. **One app, four roles** — the same React application renders a different experience depending on whether the logged-in user is a customer, rider, vendor, or admin.

```bash
npm install
npm run dev        # → http://localhost:5173
```

Requires the backend running on `:5000`.

---

## Environment

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

One variable. The REST client, the Socket.IO connection, and the image-URL helper all derive their origin from it — deliberately, so there's no second env var to forget in a production config.

---

## Structure

```
src/
├── api/api.js          One axios client. All API calls live here, grouped by domain
│                       (authAPI, orderAPI, vendorAPI, negotiationAPI, chatAPI, …)
├── realtime/socket.js  Socket.IO client singleton — connects once, on login
├── store/              Zustand: auth, cart, active branch
├── hooks/              useSocketEvent, useFavorites, useRiderTracking, …
├── components/
│   ├── brand/          MzayaIcon · MzayaWordmark · MzayaLockup
│   ├── layout/         Role-specific navigation (bottom nav, vendor side rail)
│   └── ui/             Button, Input, Badge, LoadingScreen, …
├── pages/
│   ├── home/           Customer: browse brands & products
│   ├── order/          Cart, checkout, order detail, tracking
│   ├── rider/          Job board, delivery, negotiation, earnings
│   ├── vendor/         Tablet console: orders, menu, analytics, branches
│   └── admin/          Approvals, live monitor, promos, Mzaya AI
└── utils/imageUrl.js   Resolves image paths → CDN URLs (with resizing)
```

---

## How it works

**Routing by role.** `App.jsx` reads the auth store and routes accordingly. A rider logging in lands on the job board; a vendor lands on the order console. There is no separate rider app or vendor app — it's one bundle.

**Data.** TanStack Query owns all server state. Nothing fetches in a `useEffect`.

**Real-time.** A single authenticated socket opens on login. Screens subscribe with `useSocketEvent` and invalidate the relevant query when an event lands — so real-time *triggers* the existing queries rather than replacing them. Polling remains as a slow fallback (15–20s), so a dropped socket degrades rather than breaks.

```jsx
useSocketEvent('order:updated', (payload) => {
  if (payload.orderId === id) queryClient.invalidateQueries(['order', id])
}, [id])
```

**Images.** Always go through `imageUrl()`. Pass a width to get a CDN-resized variant:

```jsx
imageUrl(vendor.logo_url, 120)     // 120px thumbnail, auto WebP
imageUrl(item.image_url, 300)      // list thumbnail
imageUrl(brand.cover_url, 800)     // hero banner
```

This matters. Zimbabwean users pay for every megabyte — a browse page must fetch thumbnails, not full-size photos. In dev (no Cloudinary) the width is ignored and local files are served as-is.

---

## Brand

Green `#00A651` is the brand colour; light tint `#EDFAF3`. Red is reserved for **semantics only** — errors, destructive actions, cancelled states. Never for branding.

The logo lives in `components/brand/` as inline SVG (`MzayaIcon.jsx`). To swap in a designer asset, replace that one file.

---

## Conventions

- Tailwind utilities for layout; inline `style` for brand colours (avoids arbitrary-value class pitfalls).
- Vendor pages are **tablet-first** and full-width (`w-full px-8`) — vendors work on tablets, not phones.
- Customer and rider pages are **phone-first**.
