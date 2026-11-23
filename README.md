# Wall Panel Kit dashboard (preview)

A Home Assistant **dashboard strategy**: you create a new dashboard, pick *Wall Panel Kit (preview)*, choose one area, and it shows that area's lights as Home Assistant's built-in tile cards. A tablet layout (columns) or a phone layout (one column, full-width tiles).

> **Preview: no release yet.** This is an early prototype. Installing it with *Add from link*, updating and removing it passed on a throw-away Home Assistant 2026.11.3 with demo data ([acceptance results](docs/acceptance.md#results)), but it has not been used in a real home. Don't rely on it yet.

| Tablet | Phone |
|---|---|
| ![The Kitchen area's lights as tiles in two columns](docs/images/tablet.png) | ![The same lights as full-width tiles in one column](docs/images/phone.png) |

<sub>Screenshots from a test Home Assistant with demo devices.</sub>

## How it relates to the Wall Panel Kit

The [Wall Panel Kit](https://github.com/davidteles/ha-wall-panel-kit) is a generator: you describe your home in a YAML file, run a Python script on your computer, and paste the dashboards it writes. That is still the way to get the full wall panel (alarm, Entry, laundry, Leaving, kiosk, theme).

This repo is a separate, much smaller experiment: a dashboard that Home Assistant builds by itself, in the browser, from your areas. No Python, no YAML to paste. For now it does one thing only.

| | Wall Panel Kit (generator) | This preview |
|---|---|---|
| How you get it | Run `tools/render.py`, paste YAML | Install from the Marketplace, then *Add dashboard* |
| What it shows | Everything in the kit | One area's lights |
| Extra cards needed | Yes (Mushroom, card-mod, …) | None, built-in tile cards only |
| Status | Released | Prototype |

## What it does, and what it never does

- Shows only `light.*` entities in the chosen area: lights assigned to the area directly, or through their device. Hidden lights and configuration/diagnostic entities are left out. Unavailable lights are still shown, marked unavailable.
- Never lists other kinds of entities (locks, alarm, cameras, sensors, switches…), even in the same area.
- An empty or deleted area shows a short message instead of an error.
- Makes no service calls, no network requests and no tracking. It reads only what Home Assistant already gives the dashboard, and never changes an existing dashboard or your configuration.
- Installing it does not change who can see what: dashboard visibility and user permissions stay as you set them in Home Assistant.

## Requirements

Home Assistant **2026.11** or newer (the built-in Marketplace and the *Community dashboards* picker).

## Using it

1. **Settings → Marketplace → Add from link**, paste this repository's address, choose **Dashboard** if asked, then **Install**, and reload the browser.
2. **Settings → Dashboards → Add dashboard → Community dashboards → Wall Panel Kit (preview)**.
3. Edit the new dashboard and choose an area and a layout.

The same in YAML (a dashboard in YAML mode):

```yaml
strategy:
  type: custom:wall-panel-kit
  area: kitchen      # the area id
  layout: tablet     # or: phone
```

## Development

No dependencies and no build step: [`dist/ha-wall-panel-dashboard.js`](dist/ha-wall-panel-dashboard.js) is both the source and the file the Marketplace installs.

```bash
npm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/acceptance.md](docs/acceptance.md).

## License

MIT
