# Architecture Decision Records

An ADR records a final decision: what, why, what else was considered. The discussion that led to it lives in a brainstorm log.

Studio-era decisions are in the vault's [Decision Log](../chromatics/01-Decisions/Decision%20Log.md) (`CD-01`…). They stay as history. An ADR that overturns one names it in Context.

## Format

```markdown
# ADR-{number}: {Title}
**Date:** YYYY-MM-DD
**Status:** Accepted | Implemented | Superseded by ADR-X | Deprecated

## Context
## Decision
## Alternatives Considered
## Consequences
```

When implementation forces a change, add a dated revision note at the top. Code and ADR never silently diverge.

## Index

**Accepted** = decided, not built. **Implemented** = in the code. Check the code before trusting either.

| ADR | Title | Date | Status |
|---|---|---|---|
| [001](./001-color-classes.md) | Color classes, storage, mutability | 2026-10-18 | Implemented |
| [002](./002-conversion-graph.md) | Conversion graph | 2026-10-18 | Implemented |
| [003](./003-numeric-policy.md) | Numeric policy | 2026-10-18 | Accepted |
| [004](./004-names-and-units.md) | Names and units | 2026-10-18 | Implemented |
| [005](./005-operations.md) | Operations | 2026-10-18 | Accepted |
| [006](./006-parse-format-equality.md) | Parsing, formatting, equality | 2026-10-18 | Accepted |
| [007](./007-package-and-tooling.md) | Package, layout, tooling, release | 2026-10-18 | Accepted |
| [008](./008-testing.md) | Testing | 2026-10-18 | Implemented |
| [009](./009-color-systems.md) | Color systems and licensing | 2026-10-18 | Accepted |
| [010](./010-build-order-and-migration.md) | Build order and studio migration | 2026-10-18 | Accepted |
| [011](./011-perceptual-models.md) | Perceptual models | 2026-10-19 | Accepted |
