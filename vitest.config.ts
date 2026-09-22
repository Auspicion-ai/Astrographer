import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // The two 10k-deep totality rows are INHERENTLY slow: measured 3.1-3.4 s in
    // isolation and 5.4-5.8 s under full-suite load against vitest 5's 5 000 ms
    // default. The budget is committed (not implied) and sized above the worst
    // measured load case with margin, because the totality contract at depth
    // 10 000 is the thing being asserted and must not be shortened.
    testTimeout: 15_000,
  },
})