# Mzaya approved vector identity — integration package

Source: approved Figma vector exports supplied in the conversation, including separate `Mzaya — Wordmark Master.svg`.

## Apply
Copy the `frontend/` folder into the repository root, merging existing folders and replacing matching files. Keep the repository's other files unchanged.

The package includes 10 SVG assets (4 primary, 4 white, 2 compatibility aliases), two React brand components and an updated brand checker. White SVG variants are derived only by replacing the flat approved emerald fill `#052A25` with white; paths are unchanged.

**Important:** The approved horizontal and stacked lockups do not include a tagline. The component renders the tagline separately, using text (not as part of the logo artwork).

## Verification
From `frontend/`:

    npm run brand:check
    npm run build
    npm run lint

If the brand checker fails on other existing SVGs, audit and replace those legacy assets before merging. Avoid overwriting any more recent source changes without reviewing the diff.

The app icon and public manifest assets are deliberately not replaced in this batch because a complete production icon set has not yet been approved.
