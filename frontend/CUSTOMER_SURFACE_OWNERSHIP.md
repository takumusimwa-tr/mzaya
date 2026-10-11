# Customer Surface Ownership Map — Batch 08.7.5
Baseline: `e37f29e1af16d4f3bfcd41e0822edb9544ee7db8`

This records which implementation owns each live customer route before final branding begins.

| Surface | Live route | Canonical implementation | Deferred counterpart |
|---|---|---|---|
| Home | `/home` | `pages/home/HomePage.jsx` | `pages/customer/HomePage.jsx` |
| Store | `/vendor/:id` | `pages/home/VendorPage.jsx` | customer composition set |
| Errands | `/errand` | `pages/home/ErrandPage.jsx` | customer composition set |
| Cart | `/cart` | `pages/order/CartPage.jsx` | `pages/customer/CartPage.jsx` |
| Checkout | `/checkout` | `pages/order/CheckoutPage.jsx` | `pages/customer/CheckoutPage.jsx` |
| Orders | `/orders`, `/orders/:id` | `pages/order/*` | customer composition set |
| Tracking | `/track/:id` | `pages/tracking/TrackingPage.jsx` | customer composition set |
| Favorites | `/favorites` | `pages/profile/FavoritesPage.jsx` | `pages/customer/FavoritesPage.jsx` |
| Addresses | `/addresses` | `pages/profile/AddressesPage.jsx` | `pages/customer/AddressFormPage.jsx` |
| Profile | `/profile` | `pages/profile/ProfilePage.jsx` | `pages/customer/EditProfilePage.jsx` |
| Help | `/help` | `pages/profile/CustomerSupportPage.jsx` | presentational HelpCenter |
| FAQ | `/help/faq` | `pages/profile/CustomerFAQPage.jsx` | presentational FAQ |
| About | `/about` | `pages/profile/CustomerAboutPage.jsx` | presentational About |
| Notifications | `/notifications` | `pages/profile/NotificationsPage.jsx` | customer composition set |

## Explicitly deferred
- LegalPage/LegalDocumentPage stay unrouted until approved legal content exists.
- ContactSupportPage stays unrouted because it does not create tickets or send messages.
- AddressFormPage stays unrouted until its structured fields are reconciled with the backend contract.
- Alternate Cart/Home/Checkout/Favorites/EditProfile pages are not route owners. Retain them as
  presentation/reference material until the branding phase decides what visual work to port.

No duplicate page is deleted in this batch.
