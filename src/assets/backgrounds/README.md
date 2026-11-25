TODO(maurice): drop real landscape photos here (jpg/jpeg/png/webp/avif).

They're picked up automatically at build time via `import.meta.glob` in
`src/stores/background.ts` — no manifest file to maintain, just add files and
run `pnpm build`. Until you add any, the "Local" background source falls
back to the placeholder gradients in `src/data/gradients.ts`.

(This replaces the old `public/backgrounds/` placeholder from Phase 1 — Vite
can auto-discover files under `src/`, but not under `public/`, which is just
copied verbatim with no build-time introspection.)
