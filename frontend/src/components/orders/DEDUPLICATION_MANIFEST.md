# Mzaya Customer UI Deduplication Manifest

This manifest accompanies the new page-level composition work.

## Canonical order components

Keep these files as the single source of truth:

```text
frontend/src/components/orders/
    CourierCard.jsx
    DeliveryAddressSummary.jsx
    DeliveryEtaCard.jsx
    OrderCard.jsx
    OrderHelpCard.jsx
    OrderItemsSummary.jsx
    OrderReferenceCard.jsx
    OrdersEmptyState.jsx
    OrdersFilterTabs.jsx
    OrderStatusBadge.jsx
    OrderStatusTimeline.jsx
    TrackingMapPanel.jsx
```

## Remove after migration

Delete or merge older components that duplicate any of the following:

- page-local order status timelines
- page-local ETA cards
- page-local courier or rider cards
- page-local order item summaries
- page-local delivery address cards
- duplicate order status badges
- duplicate active/past order tabs
- duplicate order empty states
- map wrappers tied directly to a page when they only provide presentation
- support panels embedded separately in order pages

## Migration rule

Before deleting a legacy file:

1. Search imports across the frontend.
2. Replace its imports with the canonical component.
3. Verify prop compatibility.
4. Run lint, type checking and the relevant page tests.
5. Delete the unused legacy file.
6. Search again for its filename and exported component name.

Do not delete backend-connected containers, API hooks, stores or provider adapters merely because their UI is being replaced.
