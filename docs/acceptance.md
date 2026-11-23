# Acceptance checklist (before any release)

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

- Release with the JS file as a release asset.
- A catalog (default list) request is a separate decision, and the README gets an install badge only once install, update and removal have passed here.

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

Still open: no release yet (releases need the JS file as an asset), no real home, no older Home Assistant or legacy HACS, no YAML-mode resources, no non-admin user.
