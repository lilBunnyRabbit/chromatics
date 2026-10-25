# ADR-017: Upgrading old scripts

**Date:** 2026-10-25
**Status:** Implemented


> **Revision 2026-10-25: implemented**
>
> - `src/lib/dsl/migrate.ts` infers each expression's old model and new class, so a rewrite keeps the old result: `clone()` when the receiver is already in the target class, otherwise `to(Model)` (also a copy). Old OKLCH `saturate(x)` was raw chroma, so it becomes `shift({ c: x })`; HSL-family `rotateHue` returned HSL; culori's ΔE ran in Lab D65 with CMC 1:1.
> - Units and names that changed (hsluv / hpluv 0–100 → 0–1, the YCbCr family's +0.5 chroma offset, ITP / UVW / CAM16-UCS letters, YCoCg-R order) live in `src/lib/color/legacy.ts`. CAM16, CIECAM02, TSL and XYB can't be carried over and are flagged.
> - It is a no-op on new-DSL code, which is how the banner detects an old script: it shows whenever `migrate(source)` would change something, for documents, links or pasted code alike. `DOC_SCHEMA_VERSION` is 2 and new share links use `~4` (deflate) / `~5` (plain); `~0`–`~3` still decode.
> - UI: `UpgradeBanner.svelte` above the editor (desktop and mobile) with a line-by-line review, Apply and Dismiss; "Upgrade script" in the editor header.
> - Gate: `tests/migrate.test.ts` upgrades the ten pre-package examples (kept in `tests/fixtures/legacy-examples/`) and checks them against the culori baseline; the shipped examples are the upgraded ones, hand-polished.

## Context

ADR-016 replaces the studio DSL's names with the package's and adopts JS mutation semantics, so every saved document and share link stops evaluating. The owner wants old scripts upgraded to the new system (2026-10-25). Old forms: 62 constructors (`OKLCH(…)`, `hex()`), 196 flat channel keys (`c.ok_l`), per-model views (`c.oklch.lighten()`), the `mix()` / `contrast()` / `deltaE()` free functions, and 73 method names on backed models, 54 of them absent from the package under that name. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grill 80.

## Decision

- **A codemod with a review diff (80a).** `apps/studio/src/lib/dsl/migrate.ts` takes old source and returns the new source, the list of changes and the leftovers. It works on the acorn AST and rewrites by offset. The studio shows a before / after diff; the user applies or dismisses it. It is a one-way exit, not an alias layer: the evaluator never accepts the old names.
- **Old results preserved (80b).** Every method chain whose receiver is a named colour gains `.clone()`, so a migrated script computes what it did under immutable values. Chains starting with `.to(X)` need none.
- **No equivalent: expand or flag (80c).** A method with a short package expression is inlined; one without is left in place with a `// migrate:` comment, so the evaluator errors on that line and the review lists it.
- **Detection (80d).** Documents carry a DSL version: `DOC_SCHEMA_VERSION` 2, share-link format digit 4. A v1 document or link, or pasted old code, shows a banner offering the upgrade; the editor menu has an "Upgrade script" command. The tool is permanent.
- **Gate:** every current example, migrated, evaluates in the new DSL to the culori baseline's hexes (`apps/studio/tests/fixtures/baseline/`), except differences already reviewed for the switch.
- Built with the switch, since its output must run on the new evaluator.

## Alternatives Considered

1. Quick-fix diagnostics per occurrence (CodeMirror lint actions).
2. Silent auto-migration on load, with the original kept in version history.
3. `.clone()` only where the receiver is read again later; plain rename with no clone.
4. Grill package methods for every missing studio method first; flag-only leftovers.
5. A manual command with no detection; removing the tool after a set time.

## Consequences

- The old name table lives on in one studio module, and nowhere else.
- Migrated scripts are noisier than hand-written ones (`.clone()` on most lines).
- ADR-016's "every document and link breaks" becomes "every document and link needs one reviewed upgrade".
- Leftovers from methods with no package equivalent need hand-fixing, or a later package grill.
