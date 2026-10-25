# Inbox

Unsorted ideas and bugs. Organize into ROADMAP / brainstorm / ADRs later.

## Bugs

- **Studio `src/lib/analysis/apca.ts`: APCA license conflict (owner decides).** Grill 44 found:
  - apca-w3's license (repo HEAD) limits use to WCAG web content and prohibits commercial use without a signed agreement.
  - It also forbids changing the constants, controls the names, and claims patents pending over the math.
  - The npm 0.1.9 LICENSE is looser; the "W3 cooperative agreement" is unpublished.
  - Options: keep with attribution and check the terms, replace with WCAG-only contrast, or ask the author.
  - Source quotes: the 2026-10-19 brainstorm log (grill 44).

## Ideas
