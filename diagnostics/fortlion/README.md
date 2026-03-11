# FortLion diagnostics

This folder contains reproducible scripts and versioned deliverables for the FortLion technical diagnostic.

## Quick start

1. Create `inputs.json` based on `inputs.example.json` (do not put secrets in it).
2. Export required tokens as environment variables (never commit them):
   - `RENDER_API_KEY`
   - `VERCEL_TOKEN`
   - `VERCEL_TEAM_ID` (optional)
3. Run `collect-all.ps1` and use the generated JSON to fill the report.

## Notes

- Scripts intentionally avoid printing secrets. They write structured outputs to `diagnostics/fortlion/out/`.
- If a script cannot collect a datum (API limitation, permissions, missing URLs), it still outputs a placeholder with an explicit reason.

