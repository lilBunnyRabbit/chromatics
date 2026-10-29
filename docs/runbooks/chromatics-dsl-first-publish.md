# First publish: `@lilbunnyrabbit/chromatics-dsl`

The ADR-007 first-publish runbook, applied to the DSL package (ADR-018). npm only lets a trusted publisher be added to a package that exists, so 0.1.0 goes out by hand. Owner-only steps: npm login, 2FA and the npm settings are yours.

Order matters: the DSL's peer is `@lilbunnyrabbit/chromatics ^0.2.0`, so the color package's 0.2.0 must be on npm first.

## 1. Release the color package 0.2.0

1. Merge PR #12 (`feat/chromatics-dsl`).
2. Release opens **Version Packages** (`changeset-release/master`). It bumps `@lilbunnyrabbit/chromatics` to 0.2.0. The DSL changeset stays pending: the package is still `"private": true`, so changesets skips it.
3. Merge the Version PR. CI publishes `@lilbunnyrabbit/chromatics@0.2.0` through its trusted publisher.
4. Check: `npm view @lilbunnyrabbit/chromatics version` prints `0.2.0`.

## 2. Make the DSL package publishable

1. On a branch off `master`, delete `"private": true` from `packages/chromatics-dsl/package.json`. Leave `version` at `0.0.0`.
2. PR and merge. Release opens a Version PR that bumps the DSL to 0.1.0 from `.changeset/chromatics-dsl-initial.md`.
3. Merge that Version PR. Its publish step **fails for the DSL package** (no trusted publisher yet). This is expected. `changeset publish` skips the color package, since 0.2.0 is already on the registry.

## 3. Publish 0.1.0 by hand

In a **real terminal**, not Claude Code's `!`: npm's 2FA step needs a TTY and fails with `EOTP` without one.

```sh
git switch master && git pull
bun install --frozen-lockfile
npm login
cd packages/chromatics-dsl
bun run build
npm publish --access public
```

npm's staged publishing may put a `0.0.0-stage` placeholder up first. Approve the release on npmjs.com, then check: `npm view @lilbunnyrabbit/chromatics-dsl version` prints `0.1.0`.

## 4. Trusted publisher (within 2 days)

On npmjs.com → `@lilbunnyrabbit/chromatics-dsl` → Settings:

1. **Trusted publisher:** GitHub Actions, repository `lilBunnyRabbit/chromatics`, workflow `release.yml`, no environment. Tick **Allow npm publish** (so CI publishes directly instead of staging). Leave dist-tag unticked.
2. **Publishing access:** require 2FA and disallow tokens.

## 5. From then on

- Every release is a changeset and the Version PR, as for the color package.
- Every color-package **minor** comes with a DSL **patch** changeset that widens the peer range (`^0.2.0 || ^0.3.0`). `packages/chromatics-dsl/src/peer-range.test.ts` fails until it does.
- Afterwards, add a "First publish done" note to ADR-018 (as in ADR-007) and tick the ROADMAP item.
