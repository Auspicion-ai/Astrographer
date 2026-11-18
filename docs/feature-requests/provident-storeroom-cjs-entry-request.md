# Request — a CommonJS entry for `provident-storeroom` (a fork's Electron main cannot load it)

Filed 2026-11-16 by Astrographer's `B-2` unit. **The package is never patched here** (D-9): this is a handoff,
and the finding is catalogued in `docs/defects.md` + `docs/HANDOFF.md`.

## What the fork needs

A `require`-able entry — or a `default` condition — in the package's `exports` map, so a CommonJS Electron
main bundle can load `provident-storeroom` the way it loads every other dependency.

## Why the existing route cannot serve it

Measured at `provident-storeroom@1.11.0`:

- `package.json` declares `"type": "module"` and `exports: { ".": { "types": "./index.d.ts", "import": "./index.mjs" } }`,
  with **no `main`, no `require`, no `default`**.
- A CJS `main.cjs` that `require`s it fails at load with **`ERR_PACKAGE_PATH_NOT_EXPORTED`**.
- Every fork-side workaround was measured and refused: a subpath import, a manifest shim, `createRequire`,
  `require.resolve`, and `--experimental-require-module` all fail; only an **absolute path** works, which is
  unlawful inside a shipped bundle.
- Worse, the failure is not always loud: **esbuild exits 0 and silently INLINES the ESM-only package**
  (measured: +2,667,936 B stripped, 15 package-path comments, `var import_meta = {}` in the bundle) when the
  `--external:` flag is omitted — a corrupt build that looks successful.

## The acceptance predicate a substitute must satisfy

Any of these satisfies it; the named example is the cheapest:

1. **`exports["."].require` → `./index.mjs`** (or a `default` condition). Measured: the fork's **already-built,
  unmodified `main.cjs` boots**, writes `{"display":{}}` to its profile, and the renderer arms — **zero fork
  bytes changed**.
2. A published CJS build (`"main"` + `"require"` → a `.cjs` entry), if a dual build is preferred.
3. A documented, supported statement that the package is ESM-only and that a CJS host must use a dynamic
  `await import()` seam — in which case a fork pays a Promise boundary across its store construction sites
  (18 files here), which is a real design cost and would have to be documented as expected.

## Evidence

`docs/L1/unit-b-2-display-wire.md` §5–§7 (the routes, each measured); `docs/defects.md`'s
`STOREROOM-EXPORTS-MAP-IMPORT-ONLY`; the boot smoke that produced `ERR_PACKAGE_PATH_NOT_EXPORTED` from the
fork's built `main.cjs`, and the unmodified-main boot that succeeded once the `require` condition was added to
a scratch copy of the package.

---

## DISCHARGED — `provident-storeroom@1.12.0`, published 2026-11-18

The answer is the first option requested: the exports map now reads `{".": {types, import, require}}`, with
`require` naming the same ESM entry. Verified in this fork: a `.cjs` host file loads the package
(`keys: storeCreate`) and `storeCreate` is a function. The one term the answer adds is `engines.node
>=22.12.0` (below it the loader refuses) — attested in our `package.json`; this seat runs v24.20.0. The
silent-inline trap is unchanged and the `--external:provident-storeroom` flag stays. No CJS build was
published and none is needed: one file, two specifiers, no dual-package hazard.
