# ADR-009: Color systems and licensing

**Date:** 2026-10-18
**Status:** Accepted

> **Revision 2026-10-20** (grill 74): RAL Classic waits. No clean source exists: RAL gGmbH claims rights to the collection and sells licensed libraries, Wikipedia's list (CC BY-SA) is approximate and internally inconsistent, and the studio's 45 values have no source. Revisit with open RAL data or a licence.

## Context

The owner: _"I want to support EVERY COLOR MODEL AND SCHEME (not the copywrighted like panetone)."_ A color system is a named sample set, and its data is where licensing applies. The grouping below is an understanding, not legal advice; each source is verified before its system ships. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grill 11.

## Decision

- **Ship:** CSS / X11 named colors, Munsell renotation (1943, RIT), ISCC-NBS, US Federal Standard 595, the xkcd color survey (CC0).
- **Ship, each value with a citable public source:** RAL Classic; NCS **notation and approximate conversion only**, never a licensed sample table; BS 381C / BS 4800; ANSI Z535 (defined as Munsell values). A system with no clean source waits.
- **Out:** Pantone, HKS, DIC, Toyo, Copic.
- **API:** one class per catalog with static `get(code)` (a color in the catalog's reference model), `nearest(c)` → `{ code, color, deltaE }` by ΔE2000 in Lab, and `all()` (readonly entries). Munsell is also a model (`Munsell.parse('5R 4/14')`).

## Alternatives Considered

1. Entries as their own `CatalogColor` wrapper type.
2. Catalogs as plain data + a generic `nearest(catalog, c)`.
3. Leaving every grey-zone system out: makes "every system" untrue for the most-requested one (RAL).

## Consequences

- Catalog classes depend on the Lab chain (for `nearest`), shipped only with the catalog you import.
- Open: where an entry's name and code live when `get()` returns a plain color.
