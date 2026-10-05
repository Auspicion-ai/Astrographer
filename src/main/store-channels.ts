// src/main/store-channels.ts — U-STORE-PERSIST-ADOPT (core; unit 2 of the
// store-adoption program, F2) §2.1 — THE CHANNEL-NAME CONSTANTS, DECLARED
// CONTENT ONLY. This module is the F-8 SINGLE SOURCE of the two channel-name
// literals: `src/main/main.ts` and `src/main/preload.ts` import them and never
// re-spell them; `src/renderer/**` never imports this module (the renderer
// reaches the channel through the preload member).
//
// THE EXPORT-NAME SET IS EXACTLY {STORE_FILE_GET, STORE_FILE_PUT} (CENSUS: 2
// names). NO store-symbol import, NO `src/renderer/**`/`src/shared/**` import,
// NO function, NO state — the E-2 arm-4 constraint (K-3).
//
// The `Y-3` push rides the EXISTING `webContents.send` surface and needs NO
// third constant: the constants census stays exactly TWO (§2.1).
export const STORE_FILE_GET = 'provident:store:file:get'
export const STORE_FILE_PUT = 'provident:store:file:put'
