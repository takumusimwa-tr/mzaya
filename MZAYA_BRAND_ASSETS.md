# Mzaya Core Brand Pack v1

This is the first production-ready asset pack for the current Vite/React frontend.

## Canonical colors
- Mzaya Green: `#00A651`
- Mzaya Green Dark: `#007D3D`
- Mzaya Navy: `#071B33`
- Mzaya Mint: `#E8F8EF`

## File placement in the current repository
Copy the folders as follows:

```text
frontend/src/assets/brand/logos/        <- logos/*
frontend/src/assets/brand/splash/       <- splash/*
frontend/src/assets/brand/tokens/       <- tokens/*
frontend/public/brand/app-icons/        <- app-icons/*
frontend/public/brand/favicons/         <- favicons/*
frontend/public/brand/asset-manifest.json
```

## Naming rule
Use lowercase kebab-case: `mzaya-[asset]-[variant]-[size].[ext]`.
Do not rename individual files after integration because app manifests and imports may refer to them.

## Recommended usage
- UI logo/icon: SVG files in `src/assets/brand/logos`.
- Browser/favicon/PWA: PNG files in `public/brand/favicons`.
- App store master icon: `mzaya-app-icon-1024.png`.
- Splash source: SVG; shipping fallback: 1290x2796 PNG.
- Colors: import `mzaya-tokens.css` once in `src/main.jsx` or `src/index.css`.

## Important
This v1 pack establishes the logo, icon, splash and color foundation. Onboarding illustrations, empty states and motion assets should be created only after this visual foundation is approved.
