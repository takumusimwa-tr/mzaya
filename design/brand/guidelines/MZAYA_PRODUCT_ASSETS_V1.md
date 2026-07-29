# Mzaya Product Assets v1

## Copy locations

Extract this package into the repository root. The folder structure already matches the Mzaya project.

## Onboarding

- `frontend/src/assets/brand/illustrations/onboarding/mzaya-onboarding-commerce-01.svg`
- `frontend/src/assets/brand/illustrations/onboarding/mzaya-onboarding-errands-02.svg`
- `frontend/src/assets/brand/illustrations/onboarding/mzaya-onboarding-delivery-03.svg`

## Empty state replacement

The current **No products here yet** card should use:

`frontend/src/assets/brand/illustrations/empty-states/mzaya-empty-products.svg`

Example:

```jsx
import emptyProducts from "../assets/brand/illustrations/empty-states/mzaya-empty-products.svg";

<img src={emptyProducts} alt="" aria-hidden="true" className="mx-auto w-64 max-w-full" />
```

## Category icons

Use the files under:

`frontend/src/assets/brand/icons/categories/`

These SVGs use `currentColor`, so they inherit active and inactive colors.

## Service icons

Use the files under:

`frontend/src/assets/brand/icons/services/`

## Premium implementation rules

1. Do not place text inside illustration files.
2. Keep one illustration style across customer, rider, and vendor experiences.
3. Preserve generous whitespace around every illustration.
4. Use motion only for loading, success, and tracking states.
5. Keep Lucide for ordinary UI actions such as back, close, search, edit, and settings.
6. Do not stretch SVGs; always preserve their aspect ratio.

## Suggested commit

```bash
git add frontend/src/assets/brand
git add design/brand/guidelines
git commit -m "feat(branding): add Mzaya product illustrations and service icons"
git push origin main
```
