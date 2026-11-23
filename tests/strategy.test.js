// Unit tests for the strategy's generate() and registration, with made-up
// registries. Run with: node --test
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  generateDashboard,
  lightsInArea,
  normaliseConfig,
  register,
  ELEMENT_NAME,
  EDITOR_NAME,
  STRATEGY_TYPE,
  VERSION,
} from "../dist/ha-wall-panel-dashboard.js";

const on = (name) => ({ state: "on", attributes: { friendly_name: name } });

function fakeHass() {
  return {
    areas: {
      kitchen: { area_id: "kitchen", name: "Kitchen", icon: "mdi:silverware" },
      office: { area_id: "office", name: "Office" },
      garage: { area_id: "garage", name: "Garage" },
    },
    devices: {
      dev_k: { id: "dev_k", area_id: "kitchen" },
      dev_o: { id: "dev_o", area_id: "office" },
    },
    entities: {
      // own area
      "light.kitchen_spots": { entity_id: "light.kitchen_spots", area_id: "kitchen" },
      // via its device's area
      "light.under_cabinet": { entity_id: "light.under_cabinet", device_id: "dev_k" },
      // device in kitchen, but the entity is moved to the office
      "light.desk_lamp": { entity_id: "light.desk_lamp", device_id: "dev_k", area_id: "office" },
      // unavailable, still shown
      "light.ceiling": { entity_id: "light.ceiling", area_id: "kitchen" },
      // left out
      "light.hidden_one": { entity_id: "light.hidden_one", area_id: "kitchen", hidden: true },
      "light.config_one": { entity_id: "light.config_one", area_id: "kitchen", entity_category: "config" },
      "light.no_state": { entity_id: "light.no_state", area_id: "kitchen" },
      // other domains in the same area: must never appear
      "lock.back_door": { entity_id: "lock.back_door", area_id: "kitchen" },
      "alarm_control_panel.house": { entity_id: "alarm_control_panel.house", area_id: "kitchen" },
      "camera.kitchen": { entity_id: "camera.kitchen", device_id: "dev_k" },
      "sensor.kitchen_temperature": { entity_id: "sensor.kitchen_temperature", area_id: "kitchen" },
      "switch.kettle": { entity_id: "switch.kettle", area_id: "kitchen" },
      // other area
      "light.office_ceiling": { entity_id: "light.office_ceiling", device_id: "dev_o" },
    },
    states: {
      "light.kitchen_spots": on("Spots"),
      "light.under_cabinet": on("Under cabinet"),
      "light.desk_lamp": on("Desk lamp"),
      "light.ceiling": { state: "unavailable", attributes: { friendly_name: "Ceiling" } },
      "light.hidden_one": on("Hidden"),
      "light.config_one": on("Config"),
      "lock.back_door": { state: "locked", attributes: {} },
      "alarm_control_panel.house": { state: "disarmed", attributes: {} },
      "camera.kitchen": { state: "idle", attributes: {} },
      "sensor.kitchen_temperature": { state: "21", attributes: {} },
      "switch.kettle": { state: "off", attributes: {} },
      "light.office_ceiling": on("Office ceiling"),
    },
  };
}

const view = (dash) => {
  assert.equal(dash.views.length, 1, "exactly one view");
  return dash.views[0];
};
const cards = (dash) => view(dash).sections.flatMap((s) => s.cards);
const tiles = (dash) => cards(dash).filter((c) => c.type === "tile").map((c) => c.entity);

test("one area: its lights as sorted tiles under a heading with the area icon", () => {
  const dash = generateDashboard({ type: `custom:${STRATEGY_TYPE}`, area: "kitchen" }, fakeHass());
  const v = view(dash);
  assert.equal(v.type, "sections");
  assert.equal(v.title, "Kitchen");
  const [heading] = cards(dash);
  assert.deepEqual(heading, { type: "heading", heading: "Kitchen", icon: "mdi:silverware" });
  // sorted by name: Ceiling, Spots, Under cabinet
  assert.deepEqual(tiles(dash), ["light.ceiling", "light.kitchen_spots", "light.under_cabinet"]);
});

test("device area counts, but an entity's own area overrides its device", () => {
  assert.deepEqual(lightsInArea(fakeHass(), "office"), ["light.desk_lamp", "light.office_ceiling"]);
  assert.ok(!lightsInArea(fakeHass(), "kitchen").includes("light.desk_lamp"));
});

test("an unavailable light is still shown", () => {
  assert.ok(tiles(generateDashboard({ area: "kitchen" }, fakeHass())).includes("light.ceiling"));
});

test("hidden, config/diagnostic and state-less entities are left out", () => {
  const t = tiles(generateDashboard({ area: "kitchen" }, fakeHass()));
  for (const id of ["light.hidden_one", "light.config_one", "light.no_state"]) assert.ok(!t.includes(id), id);
});

test("no other domain ever reaches the output, even in the same area", () => {
  const hass = fakeHass();
  for (const area of ["kitchen", "office", "garage", "nowhere", undefined]) {
    const text = JSON.stringify(generateDashboard({ area }, hass));
    for (const id of Object.keys(hass.entities).filter((e) => !e.startsWith("light."))) {
      assert.ok(!text.includes(id), `${id} leaked for area ${area}`);
    }
  }
  // and no light from another area
  assert.ok(!JSON.stringify(generateDashboard({ area: "kitchen" }, hass)).includes("office_ceiling"));
});

test("an area with no lights shows a message", () => {
  const dash = generateDashboard({ area: "garage" }, fakeHass());
  assert.deepEqual(tiles(dash), []);
  const md = cards(dash).find((c) => c.type === "markdown");
  assert.match(md.content, /no lights in Garage/);
});

test("a missing area id and no config both show a message, not an error", () => {
  for (const cfg of [{ area: "nowhere" }, {}, undefined, null, { area: "   " }, { area: 42 }]) {
    const dash = generateDashboard(cfg, fakeHass());
    assert.deepEqual(tiles(dash), []);
    assert.ok(cards(dash).some((c) => c.type === "markdown"), JSON.stringify(cfg));
  }
  assert.equal(cards(generateDashboard({ area: "nowhere" }, fakeHass()))[0].heading, "Area not found");
  assert.equal(cards(generateDashboard({}, fakeHass()))[0].heading, "Choose an area");
});

test("an empty or partial hass does not throw", () => {
  assert.doesNotThrow(() => generateDashboard({ area: "kitchen" }, {}));
  assert.doesNotThrow(() => generateDashboard({ area: "kitchen" }, undefined));
  assert.doesNotThrow(() => generateDashboard({ area: "kitchen" }, { areas: { kitchen: { name: "K" } } }));
});

test("layouts: phone is one column with full-width tiles, tablet three, unknown is tablet", () => {
  const phone = generateDashboard({ area: "kitchen", layout: "phone" }, fakeHass());
  assert.equal(view(phone).max_columns, 1);
  for (const c of cards(phone).filter((c) => c.type === "tile")) assert.deepEqual(c.grid_options, { columns: 12 });

  const tablet = generateDashboard({ area: "kitchen", layout: "tablet" }, fakeHass());
  assert.equal(view(tablet).max_columns, 3);
  for (const c of cards(tablet).filter((c) => c.type === "tile")) assert.equal(c.grid_options, undefined);

  assert.deepEqual(generateDashboard({ area: "kitchen", layout: "watch" }, fakeHass()), tablet);
  assert.deepEqual(generateDashboard({ area: "kitchen" }, fakeHass()), tablet);
  assert.equal(normaliseConfig({ layout: "phone" }).layout, "phone");
  assert.equal(view(generateDashboard({ layout: "phone" }, fakeHass())).max_columns, 1);
});

test("pure: no service, websocket, API or network call; same output every time", async () => {
  const boom = () => {
    throw new Error("must not be called");
  };
  const hass = {
    ...fakeHass(),
    callService: boom,
    callWS: boom,
    callApi: boom,
    fetchWithAuth: boom,
    connection: { sendMessage: boom, sendMessagePromise: boom, subscribeMessage: boom },
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = boom;
  try {
    const before = JSON.stringify(hass.states);
    const a = generateDashboard({ area: "kitchen" }, hass);
    const b = generateDashboard({ area: "kitchen" }, hass);
    assert.deepEqual(a, b);
    assert.equal(JSON.stringify(hass.states), before, "hass not modified");

    // the strategy element's generate() is the same function
    const win = fakeWindow();
    register(win);
    const c = await win.customElements.get(ELEMENT_NAME).generate({ area: "kitchen" }, hass);
    assert.deepEqual(c, a);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("an area name is escaped inside markdown but shown as-is in the heading", () => {
  const hass = fakeHass();
  hass.areas.garage.name = "<b>Shed</b> & *Co*";
  const dash = generateDashboard({ area: "garage" }, hass);
  const [heading, md] = cards(dash);
  assert.equal(heading.heading, "<b>Shed</b> & *Co*");
  assert.ok(!md.content.includes("<b>"));
  assert.ok(!md.content.includes("*Co*"));
  assert.match(md.content, /&#60;b&#62;Shed/);
});

// ---- registration and editor, with a fake browser ----

function fakeWindow() {
  const registry = new Map();
  class FakeElement {
    constructor() {
      this.children = [];
      this.events = [];
      this._listeners = {};
    }
    appendChild(c) {
      this.children.push(c);
    }
    addEventListener(name, fn) {
      (this._listeners[name] ||= []).push(fn);
    }
    dispatchEvent(ev) {
      this.events.push(ev);
      for (const fn of this._listeners[ev.type] || []) fn(ev);
      return true;
    }
  }
  const win = {
    HTMLElement: FakeElement,
    CustomEvent: globalThis.CustomEvent,
    customElements: {
      defineCalls: 0,
      get: (n) => registry.get(n),
      define(n, cls) {
        if (registry.has(n)) throw new Error(`${n} already defined`);
        this.defineCalls++;
        registry.set(n, cls);
      },
    },
    document: {
      createElement(n) {
        const Cls = registry.get(n);
        const el = Cls ? new Cls() : new FakeElement();
        el.tagName = n;
        return el;
      },
    },
  };
  return win;
}

test("register() defines the strategy, its editor and one picker entry, even when called twice", () => {
  const win = fakeWindow();
  win.customStrategies = [{ type: "someone-else", strategyType: "dashboard", name: "Other" }];
  assert.equal(register(win), true);
  assert.equal(register(win), true);
  assert.equal(win.customElements.defineCalls, 2);
  assert.equal(typeof win.customElements.get(ELEMENT_NAME).generate, "function");
  assert.ok(win.customElements.get(EDITOR_NAME));
  const ours = win.customStrategies.filter((s) => s.type === STRATEGY_TYPE);
  assert.equal(ours.length, 1);
  assert.deepEqual(
    { type: ours[0].type, strategyType: ours[0].strategyType, name: ours[0].name },
    { type: "wall-panel-kit", strategyType: "dashboard", name: "Wall Panel Kit (preview)" },
  );
  assert.equal(win.customStrategies.length, 2, "other strategies kept");
  assert.equal(ELEMENT_NAME, "ll-strategy-dashboard-wall-panel-kit");
});

test("register() does nothing without a browser", () => {
  assert.equal(register(undefined), false);
  assert.equal(register({}), false);
});

test("the editor shows an area + layout form and emits a normalised config", async () => {
  const win = fakeWindow();
  register(win);
  const editor = await win.customElements.get(ELEMENT_NAME).getConfigElement();
  assert.equal(editor.tagName, EDITOR_NAME);
  editor.hass = fakeHass();
  editor.setConfig({ type: `custom:${STRATEGY_TYPE}` });
  const form = editor.children[0];
  assert.equal(form.tagName, "ha-form");
  assert.deepEqual(form.schema.map((s) => s.name), ["area", "layout"]);
  assert.equal(form.data.layout, "tablet");
  assert.equal(form.data.area, undefined);

  let stopped = false;
  form.dispatchEvent({
    type: "value-changed",
    detail: { value: { area: " office ", layout: "phone" } },
    stopPropagation: () => (stopped = true),
  });
  assert.ok(stopped);
  const ev = editor.events.find((e) => e.type === "config-changed");
  assert.deepEqual(ev.detail.config, { type: `custom:${STRATEGY_TYPE}`, area: "office", layout: "phone" });

  form.dispatchEvent({ type: "value-changed", detail: { value: { area: "", layout: "nonsense" } }, stopPropagation() {} });
  const last = editor.events.filter((e) => e.type === "config-changed").at(-1);
  assert.deepEqual(last.detail.config, { type: `custom:${STRATEGY_TYPE}`, layout: "tablet" });
});

test("version is semver and matches package.json", async () => {
  const { readFile } = await import("node:fs/promises");
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.version, VERSION);
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
});

test("hacs.json points at the shipped file", async () => {
  const { readFile, access } = await import("node:fs/promises");
  const meta = JSON.parse(await readFile(new URL("../hacs.json", import.meta.url), "utf8"));
  assert.ok(meta.name);
  await access(new URL(`../dist/${meta.filename}`, import.meta.url));
});
