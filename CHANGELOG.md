# Changelog

All notable changes to this project. Versions follow [semantic versioning](https://semver.org/); each entry links to its full release notes on GitHub, which also say how each change was tested.

## [0.1.2] — 2026-11-24

- **Now in the Marketplace's default list** ([hacs/default#14833](https://github.com/hacs/default/pull/14833), merged 2026-11-24): search for **Wall Panel Kit** in **Settings → Marketplace** to install it.
- The README's status note and *Using it* steps say so, as the reviewer asked.
- The [acceptance record](https://github.com/davidteles/ha-wall-panel-dashboard/blob/v0.1.2/docs/acceptance.md#results) now includes run 3: updating from v0.1.0 to v0.1.1 kept one resource and the dashboard unchanged, and a Marketplace search on a throw-away Home Assistant…
- `VERSION` in the JS file is now `0.1.2`; that line is the only change to it.

## [0.1.1] — 2026-11-24

Docs update, same code.

- The README says what is true now: released, installable with **Add from link**, and not yet in the Marketplace's default list (the request, hacs/default#14833, is open, so searching won't find it).
- It also says older Home Assistant versions and the older HACS add-on are not supported, explains how to remove the dashboard, and notes that it doesn't replace the [Wall Panel Kit](https://github.com/davidteles/ha-wall-panel-kit).
- The [acceptance record](https://github.com/davidteles/ha-wall-panel-dashboard/blob/v0.1.1/docs/acceptance.md#results) now includes run 2: the published v0.1.0 release installed with *Add from link* on a throw-away Home Assistant 2026.11.3 passed every check.
- `VERSION` in the JS file is now `0.1.1`; that line is the only change to it.

## [0.1.0] — 2026-11-23

Preview: one area's lights.

- Lights only, from the chosen area (directly or through their device). Unavailable lights are shown as unavailable; hidden and configuration entities are left out.
- Never lists locks, the alarm, cameras, sensors or switches, even in the same area.
- An empty or deleted area shows a short message instead of an error.
- No service calls, no network requests, no tracking, no extra cards. It never changes an existing dashboard or your configuration.

[0.1.2]: https://github.com/davidteles/ha-wall-panel-dashboard/releases/tag/v0.1.2
[0.1.1]: https://github.com/davidteles/ha-wall-panel-dashboard/releases/tag/v0.1.1
[0.1.0]: https://github.com/davidteles/ha-wall-panel-dashboard/releases/tag/v0.1.0
