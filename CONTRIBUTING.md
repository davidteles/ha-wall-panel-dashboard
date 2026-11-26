# Contributing and branching

## Branching strategy (GitHub flow)

- **`main` is protected and always releasable.** Nothing is pushed to it directly. Every change arrives as a pull request.
  A ruleset enforces it: no direct pushes, no force-pushes or deletion, and pull requests need the code owner's approval.
- Work happens on short-lived branches, named by type:

  | Prefix | For |
  |---|---|
  | `feat/…` | New features |
  | `fix/…` | Bug fixes |
  | `docs/…` | Documentation only |
  | `chore/…` | Tooling, CI, housekeeping |

- **Pull requests:**
  - Must pass the checks.
  - Must be approved by the code owner (`@davidteles`). Only the owner approves and merges.
  - Are **squash-merged**, so `main` gets one clean commit per PR, titled after the PR. The branch is deleted after merging.
- **Releases** (integrations and cards) are tagged `vMAJOR.MINOR.PATCH` (semantic versioning) on `main`, with release notes. The release PR also adds a short entry at the top of `CHANGELOG.md`, so the tag includes it.
  - Patch: fixes.
  - Minor: new features.
  - Major: anything that breaks existing setups.

## Commit messages

Imperative and short ("Add water tank sensor"), with a body explaining *why* when it isn't obvious.

## Privacy

No personal data, keys, tokens, codes or private hostnames, ever. Screenshots are people-free, with maps and balances blurred.

## Tests

`npm test` (Node 22 or newer, no dependencies to install) runs the `generate()` and registration tests in `tests/`. `npm run check` checks the shipped file's syntax. Both run in CI on every pull request.

Passing tests prove the dashboard that `generate()` returns for made-up registries. They don't prove the Marketplace install or how Home Assistant shows it: that's the checklist in [docs/acceptance.md](docs/acceptance.md), run on a throw-away Home Assistant.

Keep the scope rule: the strategy only ever puts `light.*` entities of the chosen area on the page, makes no service or network calls, and never writes configuration. A change that widens that needs its own opt-in setting and a test.
