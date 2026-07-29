# Mzaya Premium UI Integration v1

This release applies the approved brand system to the current React frontend.

## Updated screens

- Premium onboarding carousel with three branded illustrations
- Role-selection experience
- Branded login experience
- Mzaya loading screen
- Home category icons and product empty state
- Errand service icon family
- Official logo components and browser favicons
- Shared colors, typography, spacing, shadows and motion tokens

## Install

Extract this package into the root of the Mzaya repository and allow matching folders to merge.

## Review locally

```powershell
cd frontend
npm install
npm run build
npm run dev
```

Review `/welcome`, `/login`, `/home`, and `/errand` before committing.

## Suggested commit

```powershell
git add design frontend/public/brand frontend/src/assets/brand frontend/src/components/brand frontend/src/components/ui/LoadingScreen.jsx frontend/src/pages/onboarding/OnboardingPage.jsx frontend/src/pages/auth/LoginPage.jsx frontend/src/pages/home/HomePage.jsx frontend/src/pages/home/ErrandPage.jsx frontend/src/index.css frontend/index.html MZAYA_PREMIUM_UI_INTEGRATION.md
git commit -m "feat(branding): integrate premium Mzaya product experience"
git push origin main
```
