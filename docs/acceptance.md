# Acceptance checklist

Unit tests (`npm test`) cover what `generate()` returns. These checks cover what they can't: the Marketplace install and how Home Assistant shows the dashboard.

Run them on a **throw-away Home Assistant 2026.11 or newer** with demo data only: no real devices, phones or household integrations. Record for each run: version · Home Assistant version · browser · steps · result · next action.

## Install

- [ ] As admin: **Settings → Marketplace → Add from link** with the repository address; connect GitHub if prompted; choose **Dashboard** if asked; open the repository; **Install**. Reload the browser.
- [ ] **Settings → Dashboards → Resources** has exactly one `module` resource under `/local/community/ha-wall-panel-dashboard/`. (If resources are managed in YAML, follow the install dialog instead and note what it said.)
- [ ] The browser console shows no errors from the file.

## Create and use

- [ ] **Add dashboard → Community dashboards** lists *Wall Panel Kit (preview)*. Create a **new** dashboard with it.
- [ ] Before an area is chosen: the "Choose an area" message, no error.
- [ ] The editor shows an area picker and a layout choice; saving updates the dashboard.
- [ ] An area with two or three demo lights: one tile per light, sorted by name, the heading with the area name (and icon if set). Tiles toggle the demo lights.
- [ ] An unavailable demo light is shown as unavailable.
- [ ] The same area's demo lock, alarm panel, camera and sensors do **not** appear.
- [ ] An area with no lights: the "no lights" message. Deleting the chosen area: the "Area not found" message.
- [ ] Phone width (about 390 px): one column, full-width tiles. Tablet (about 1024 × 768, both orientations): columns.
- [ ] No service calls on load (logbook and the browser's network tab show nothing but the usual frontend traffic).
- [ ] Existing dashboards are unchanged; no helpers, automations or other cards were added.

## Update and remove

- [ ] Install a newer test build: still one resource entry, still one *Wall Panel Kit (preview)* in the picker, the dashboard reloads correctly.
- [ ] Delete the test dashboard, then remove the repository from the Marketplace: the resource entry is gone and nothing else is left behind.

## Only after all of the above

- Release with the JS file as a release asset. *Done: [v0.1.0](https://github.com/davidteles/ha-wall-panel-dashboard/releases/tag/v0.1.0), 2026-11-23.*
- A catalog (default list) request is a separate decision, and the README gets an install badge only once install, update and removal have passed here. *Merged 2026-11-24: [hacs/default#14833](https://github.com/hacs/default/pull/14833). Searching the Marketplace now finds it (checked in [run 3](#results)); Add from link still works as a fallback.*

## Released file (v0.1.0)

Run 1 below tested commit `d26dbda`, just before the release. Its `dist/ha-wall-panel-dashboard.js` is byte-identical to the v0.1.0 release asset (sha256 `4f6f599cbf556a24e6dc6a1ad60cce6d67f173b04a8c6bc173fac365146763d6`), and installing the published release itself passed in [run 2](#results) on 2026-11-24. Same rules as above: a throw-away Home Assistant 2026.11 or newer with demo data only.

- [x] Add from link, then Install. The version offered is **v0.1.0**, not a commit.
- [x] The file served at `/local/community/ha-wall-panel-dashboard/ha-wall-panel-dashboard.js` has the sha256 above.
- [x] Exactly one `module` resource, and in the browser console `customStrategies.filter(s => s.type === 'wall-panel-kit').length` is `1`.
- [x] Community dashboards lists *Wall Panel Kit (preview)*. Create a **new** dashboard and choose an area and a layout.
- [x] Change the area to another one: the dashboard follows the change. (The area field is required and has no clear button, so it cannot be cleared from the editor; see run 2.)
- [x] Open the dashboard's address directly in a fresh tab (cold load): it renders with no errors.
- [x] Restart Home Assistant: still one resource, dashboard still there.
- [x] Toggle one demo light from a tile.
- [x] Delete the test dashboard, then Uninstall: the resource and files are gone.

Record: tag and asset sha256 · Home Assistant version · browsers · each result · next action.

## Results

**Run 1 · 2026-11-23 · commit `d26dbda` (no release) · Home Assistant 2026.11.3 · headless Chrome and the Claude desktop app's browser · throw-away instance on 127.0.0.1 with the `demo` integration only (no discovery, cloud, phones or household integrations)**

Test data: Kitchen with two demo lights on their devices, a template light that is always unavailable, the demo alarm panel and a demo switch; a light whose device is in the Kitchen but which has its own area (Bedroom); an empty Garage; an Office with one light, deleted during the run.

| Check | Result |
|---|---|
| Add from link | Pass. Needed a GitHub connection first (device sign-in); the type was detected as Dashboard without asking |
| Install | Pass. The page showed "Requires Home Assistant 2026.11.0", read from `hacs.json`. Files in `www/community/ha-wall-panel-dashboard/`, identical to `dist/`. Exactly one `module` resource, `/local/community/ha-wall-panel-dashboard/ha-wall-panel-dashboard.js?v=…`, served with no restart. No console errors |
| Community dashboards picker | Pass. *Wall Panel Kit (preview)* with its description, under **Community dashboards** |
| Before choosing an area | Pass. "Choose an area" message |
| Editor | Pass. Area picker and Tablet/Phone choice inside Home Assistant's own *Edit dashboard* dialog; the saved config is exactly `strategy: {type: custom:wall-panel-kit, area, layout}` |
| Area with lights | Pass. Broken lamp (Unavailable), Ceiling Lights, Kitchen Lights: sorted, area name and icon in the heading. The Bedroom light, alarm panel and switch did not appear |
| Tile tap | Pass. Toggled the demo light |
| No service calls on load | Pass. A `call_service` listener during a reload saw nothing; the only call was the tile tap |
| Empty area / deleted area | Pass. "No lights in Garage" and "Area not found" messages |
| Phone 390 × 844 | Pass. One column, full-width tiles, no sideways scroll |
| Tablet 1024 × 768 and 768 × 1024 | Pass. Two tiles per row in both orientations. With one area there is only one section, so the three-column setting has no visible effect yet |
| Nothing else changed | Pass. Only the test dashboard was added; no helpers, automations, scripts or other cards; the default Overview untouched |
| Survives a restart | Pass. One resource, dashboard still there |
| Update | Pass. Installed the older commit `046ceb7`, then updated from **Settings → Updates**: still one resource (version in `?v=` changed), one script tag, one picker entry, dashboard reloads |
| Removal | Pass. Deleted the test dashboard; **Uninstall** removed the files, the resource and the update entity; removing the link entry left nothing in the Marketplace |

Notes, not defects of this package: right after **Uninstall**, the repository page kept showing "installed" until the page was reloaded.

Still open at the time of run 1 (2026-11-23, before v0.1.0 was published later that day): no release yet (releases need the JS file as an asset). Still open now: no real home, no older Home Assistant or legacy HACS, no YAML-mode resources, no non-admin user.

**Run 2 · 2026-11-24 · release v0.1.0 (asset sha256 `4f6f599c…63d6`) · Home Assistant 2026.11.3 · the Claude desktop app's browser at 1280 × 900 and 589 × 506 · the same throw-away instance on 127.0.0.1, `demo` integration only, started with no resources and no dashboards except Map**

| Check | Result |
|---|---|
| Add from link | Pass. The GitHub connection from run 1 was still there, so no sign-in |
| Version offered | Pass. "Version v0.1.0 is available to install"; the install dialog said "This installs Wall Panel Kit (preview) version v0.1.0" |
| Installed file | Pass. `www/community/ha-wall-panel-dashboard/ha-wall-panel-dashboard.js` and the file served at `/local/community/…` both have the release asset's sha256 |
| Resource and registration | Pass. Exactly one `module` resource, `…/ha-wall-panel-dashboard.js?v=1469368233-v0.1.0`. In the browser: one `wall-panel-kit` entry in `customStrategies`, strategy and editor elements defined. No console errors |
| Community dashboards picker | Pass. *Wall Panel Kit (preview)* listed; created a new dashboard, "Choose an area" shown first |
| Area with lights | Pass. Kitchen: Broken lamp (Unavailable), Ceiling Lights, Kitchen Lights, sorted, area icon in the heading; the light with its own area (Bedroom) left out |
| Change the area | Pass. Living Room: its one light; the saved config is exactly `strategy: {type: custom:wall-panel-kit, layout: tablet, area: living_room}` |
| Clear the area | Not possible in the editor: the field is required and has no clear button. Checked the editor code directly in the page: if the form sends an empty area, it is removed ("Choose an area"); if the form leaves the area key out entirely, the old area is kept. Home Assistant's form did not do that here, so this is a code note, not a reproduced bug |
| Cold direct load | Pass. The dashboard's address opened in a new tab rendered with no console errors |
| No service calls on load | Pass. A `call_service` listener saw nothing during a reload; the only call was the tile tap |
| Tile tap | Pass. `light.turn_off` for the Living Room demo light |
| Restart | Pass. Still one resource, the dashboard and its config still there and rendering, one strategy entry |
| Delete and uninstall | Pass. Deleted the dashboard from its editor, then **Uninstall**: no resources, the `community` folder empty, the file URL returns 404, no update entity left |

Notes, not defects:
- The page had two `<script>` tags with the same module URL after opening the dashboards page and then *Add dashboard*. A module with one URL runs once, and there was one strategy entry.
- The Marketplace page shows the README from the release tag, so it still says "Preview: no release yet" until a release made after that wording changed.

**Run 3 · 2026-11-24 · release v0.1.1 (asset sha256 `bb5e9630…57b5`, identical to `dist/`) · Home Assistant 2026.11.3 · the Claude desktop app's browser · the same throw-away instance on 127.0.0.1, `demo` integration only**

| Check | Result |
|---|---|
| Update from v0.1.0 | Pass. Installed v0.1.0, created a phone-layout test dashboard, then updated from the update dialog, which showed the v0.1.1 release notes. Still one `module` resource, now `…/ha-wall-panel-dashboard.js?v=1469368233-v0.1.1`; the served file has the v0.1.1 asset's sha256; the dashboard config was unchanged (`strategy: {type: custom:wall-panel-kit, area: kitchen, layout: phone}`) and rendered |
| Marketplace page README | Pass. With nothing installed, the page shows the README of the latest release (v0.1.1) |
| Delete and uninstall | Pass. Deleted the test dashboard, then **Uninstall**: no resources left |
| Search after listing | Pass (after hacs/default#14833 was merged). Searching the Marketplace for "wall panel kit" lists *Wall Panel Kit (preview)* as a Dashboard; its menu has no "Remove" entry, so the result comes from the default list, not from the earlier link entry |

Still open: no real home, no older Home Assistant or legacy HACS, no YAML-mode resources, no non-admin user.
