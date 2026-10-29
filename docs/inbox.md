# Inbox

Unsorted ideas and bugs. Organize into ROADMAP / brainstorm / ADRs later.

## Bugs

- **Color package: `Cmyk` parse ↔ toString not exact for tiny channels.** `device-cmyk(9.43e-16 9.43e-16 0.003145 0 / 0)` fails `cmyk.test.ts > strings: parse ↔ toString exact` with `FC_SEED=1017574771` (node and bun); CI's seed 42 passes. Separate PR after #12 (owner, 2026-10-26): pin the seed as a regression test, root-cause.
- **Studio `src/lib/analysis/apca.ts`: APCA license conflict (owner decides).** Grill 44 found:
  - apca-w3's license (repo HEAD) limits use to WCAG web content and prohibits commercial use without a signed agreement.
  - It also forbids changing the constants, controls the names, and claims patents pending over the math.
  - The npm 0.1.9 LICENSE is looser; the "W3 cooperative agreement" is unpublished.
  - Options: keep with attribution and check the terms, replace with WCAG-only contrast, or ask the author.
  - Source quotes: the 2026-10-19 brainstorm log (grill 44).

## Ideas
