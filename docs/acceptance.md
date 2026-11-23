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

- Add a people-free screenshot of the test dashboard to the README, and remove `ignore: images` from the HACS check in CI.
- Release with the JS file as a release asset.
- A catalog (default list) request is a separate decision, and the README gets an install badge only once install, update and removal have passed here.
