// src/main/store-channels.ts — U-STORE-PERSIST-ADOPT (core; unit 2 of the
// store-adoption program, F2) §2.1 — THE CHANNEL-NAME CONSTANTS, DECLARED
// CONTENT ONLY. This module is the F-8 SINGLE SOURCE of the channel-name
// literals: `src/main/main.ts` and `src/main/preload.ts` import them and never
// re-spell them; `src/renderer/**` never imports this module (the renderer
// reaches the channel through the preload member).
//
// THE EXPORT-NAME SET IS EXACTLY {STORE_FILE_GET, STORE_FILE_PUT, DISPLAY_READ,
// DISPLAY_CHANGED, DISPLAY_WRITE} (CENSUS: 5 names). NO store-symbol import, NO
// `src/renderer/**`/`src/shared/**` import, NO function, NO state — the E-2
// arm-4 constraint (K-3).
//
// The `Y-3` push rides the EXISTING `webContents.send` surface and needs no
// constant of its own: it is ONE member with one subject, and adding a third
// name for it would have been a claim about a channel that does not exist. THE
// SAME CLAUSE IS WHY `DISPLAY_WRITE` IS A NAME AND NOT A SECOND SPELLING OF
// ONE: the push (`DISPLAY_CHANGED`) is a SIGNAL and the write (`DISPLAY_WRITE`)
// is a REQUEST, so the census above reads FIVE names and the two display
// mechanisms keep one name each (`B-10` §5).
//
// **THE TWO DISPLAY CONSTANTS ARE UNIT `B-2` `display-wire`'s**
// (`docs/L1/unit-b-2-display-wire.md` §4), and they are TWO because there are
// two MECHANISMS, not two spellings of one: `DISPLAY_READ` is a REQUEST
// (`invoke`/`handle`) and `DISPLAY_CHANGED` is a SIGNAL (`send`/`on`). One
// collapsed constant would be a row that cannot fail while no reader could tell
// a request from a signal. **THEIR HOME IS THIS MODULE AND NOT
// `src/shared/types.ts`**, which `B-2` does not touch: three flat rows pin that
// file's md5, so a byte there buys a digest re-statement outside that unit's
// write scope, while this module yields ONE structural sentence its own edit
// amends. **AND THE THIRD DISPLAY NAME IS UNIT `B-10`'s** (`docs/L1/unit-b-10-
// stage-display-state.md` §5, taken under §9 `O-1`): the record's write is a
// REQUEST of its own, with one job — the answer is the record's own
// `DisplayWriteAnswer` and nothing else crosses it.
export const STORE_FILE_GET = 'provident:store:file:get'
export const STORE_FILE_PUT = 'provident:store:file:put'
/** Unit `B-2` §4 — the DISPLAY READ: a REQUEST (`invoke`/`handle`), answered by the record's own reading or the DECLARED
 *  `null`. It never throws and it judges nothing; the renderer's client is the only authority on what a reading means. */
export const DISPLAY_READ = 'provident:display:read'
/** Unit `B-2` §4 — the DISPLAY PUSH: a SIGNAL (`send`/`on`) that **carries nothing** — no value, no address, no reading
 *  (`D-24`, `forking.md` §2.5). Its only correct answer is the realm's own re-read. */
export const DISPLAY_CHANGED = 'provident:display:changed'
/** Unit `B-10` §5 (`docs/L1/unit-b-10-stage-display-state.md`, taken under §9 `O-1`) — the DISPLAY WRITE: a REQUEST
 *  (`invoke`/`handle`) with ONE job, carrying `{tabId, entry}` and answering the record's OWN `DisplayWriteAnswer`. It is a
 *  name of its own because it is a different mechanism from the push (a signal carries nothing and asks for a re-read; a request
 *  carries the address and the whole entry and answers a verdict), and because a collapsed constant would leave a reader unable
 *  to tell the two apart — the same reason `DISPLAY_READ` and `DISPLAY_CHANGED` are two. */
export const DISPLAY_WRITE = 'provident:display:write'
