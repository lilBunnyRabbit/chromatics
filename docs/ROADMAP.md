# Roadmap

What's done and what's next. Single source of truth for progress.

**Legend:** `[ ]` not started | `[-]` in progress | `[x]` done

---

## Order

Agreed with the owner on 2026-10-18 ([brainstorm](brainstorm/2026-10-18-own-color-library.md)).

1. [x] **Prior-art investigation**: every earlier library iteration, the vault, the culori wrapper ([Library Investigation](chromatics/04-Product/Library%20Investigation.md))
2. [x] **Agent rules**: PRINCIPLES, CONVENTIONS, ADRs, brainstorm logs, this roadmap (modelled on webos, tuned for package work)
3. [-] **API grill**: 14 rounds decided 2026-10-18, recorded as [ADR-001…010](adrs/README.md). Numbers sourced 2026-10-19. Left: catalog entry metadata, the DSL adapter shape (at migration)
4. [-] **Package on a branch** (`feat/color-package`): `packages/chromatics` + Bun workspaces (scaffolded 2026-10-19: base class, router, exact matrix generator, Vitest on both engines), then the core models (ADR-010), each with the full test matrix (ADR-008). Blocked on publishing `@lilbunnyrabbit/optional` 1.1.0 only for release, not for development
5. [ ] **Monorepo**: this repo hosts the package and the website
6. [ ] **Studio on the package**: culori removed from the app

## Studio

Existing app work is tracked in the vault's [Roadmap](chromatics/04-Product/Roadmap.md) until it moves here.
