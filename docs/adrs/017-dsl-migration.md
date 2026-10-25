# ADR-017: Upgrading old scripts

**Date:** 2026-10-25
**Status:** Accepted

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
