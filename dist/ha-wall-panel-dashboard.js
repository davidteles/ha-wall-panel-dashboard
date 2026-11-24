/*
 * Wall Panel Kit dashboard (preview) — a Home Assistant dashboard strategy.
 *
 * It builds a dashboard for ONE area you choose, showing that area's lights as
 * Home Assistant's built-in tile cards. Nothing else.
 *
 * - Reads only what Home Assistant already gives the frontend (hass.areas,
 *   hass.devices, hass.entities, hass.states).
 * - Never calls a service, never fetches anything, never writes config.
 * - Only `light.*` entities are ever put on the page.
 *
 * Plain ES module, no dependencies and no build step: this file is both the
 * source and what the Marketplace installs.
 */

export const VERSION = "0.1.2";
export const STRATEGY_TYPE = "wall-panel-kit";
export const ELEMENT_NAME = `ll-strategy-dashboard-${STRATEGY_TYPE}`;
export const EDITOR_NAME = `${STRATEGY_TYPE}-dashboard-strategy-editor`;
export const LAYOUTS = ["tablet", "phone"];
export const DEFAULT_LAYOUT = "tablet";

const DOMAIN = "light";

/** Escape text before it goes into a markdown card. */
export function escapeText(text) {
  return String(text).replace(/[&<>"'`*_\[\]\\#|]/g, (c) => `&#${c.charCodeAt(0)};`);
}

function areaOfEntity(entity, devices) {
  if (entity.area_id) return entity.area_id;
  const device = entity.device_id ? devices[entity.device_id] : undefined;
  return device ? device.area_id || null : null;
}

function displayName(entityId, entity, states) {
  const state = states[entityId];
  return (
    (entity && entity.name) ||
    (state && state.attributes && state.attributes.friendly_name) ||
    entityId
  );
}

/**
 * The lights shown for an area: registry entities of the light domain whose
 * own area (or, if they have none, their device's area) is the chosen area.
 * Hidden entities, config/diagnostic entities and entities with no state at
 * all are left out. Unavailable lights stay: the tile shows them as such.
 */
export function lightsInArea(hass, areaId) {
  const entities = hass.entities || {};
  const devices = hass.devices || {};
  const states = hass.states || {};
  const found = [];
  for (const [entityId, entity] of Object.entries(entities)) {
    if (!entityId.startsWith(`${DOMAIN}.`)) continue;
    if (!entity || entity.hidden || entity.entity_category) continue;
    if (!(entityId in states)) continue;
    if (areaOfEntity(entity, devices) !== areaId) continue;
    found.push(entityId);
  }
  return found.sort((a, b) => {
    const na = String(displayName(a, entities[a], states)).toLowerCase();
    const nb = String(displayName(b, entities[b], states)).toLowerCase();
    return na < nb ? -1 : na > nb ? 1 : a < b ? -1 : a > b ? 1 : 0;
  });
}

function messageView(title, text, layout) {
  return {
    title: "Wall Panel",
    path: "wall-panel",
    type: "sections",
    max_columns: layout === "phone" ? 1 : 3,
    sections: [
      {
        type: "grid",
        cards: [
          { type: "heading", heading: title },
          { type: "markdown", content: text },
        ],
      },
    ],
  };
}

export function normaliseConfig(config) {
  const c = config || {};
  const layout = LAYOUTS.includes(c.layout) ? c.layout : DEFAULT_LAYOUT;
  const area = typeof c.area === "string" && c.area.trim() ? c.area.trim() : null;
  return { area, layout };
}

/** Build the dashboard. Pure: same input, same output, no side effects. */
export function generateDashboard(config, hass) {
  const { area, layout } = normaliseConfig(config);
  const areas = (hass && hass.areas) || {};

  if (!area) {
    return {
      views: [
        messageView(
          "Choose an area",
          "This dashboard shows the lights of one area. Edit the dashboard and choose an area.",
          layout,
        ),
      ],
    };
  }

  const areaEntry = areas[area];
  if (!areaEntry) {
    return {
      views: [
        messageView(
          "Area not found",
          "The chosen area no longer exists. Edit the dashboard and choose another area.",
          layout,
        ),
      ],
    };
  }

  const areaName = areaEntry.name || area;
  const lights = lightsInArea(hass, area);
  if (lights.length === 0) {
    return {
      views: [
        messageView(
          areaName,
          `There are no lights in ${escapeText(areaName)} yet. Assign lights to this area, or choose another area.`,
          layout,
        ),
      ],
    };
  }

  const tile = (entity) =>
    layout === "phone"
      ? { type: "tile", entity, grid_options: { columns: 12 } }
      : { type: "tile", entity };

  const heading = { type: "heading", heading: areaName };
  if (areaEntry.icon) heading.icon = areaEntry.icon;

  return {
    views: [
      {
        title: areaName,
        path: "wall-panel",
        type: "sections",
        max_columns: layout === "phone" ? 1 : 3,
        sections: [{ type: "grid", cards: [heading, ...lights.map(tile)] }],
      },
    ],
  };
}

/** The form the dashboard editor shows (rendered by Home Assistant's ha-form). */
export const EDITOR_SCHEMA = [
  { name: "area", required: true, selector: { area: {} } },
  {
    name: "layout",
    required: true,
    selector: {
      select: {
        mode: "list",
        options: [
          { value: "tablet", label: "Tablet (columns)" },
          { value: "phone", label: "Phone (one column)" },
        ],
      },
    },
  },
];

const LABELS = { area: "Area", layout: "Layout" };

/**
 * Define the strategy element, its editor and the picker entry on `win`.
 * Safe to call more than once: nothing is registered twice.
 */
export function register(win) {
  if (!win || !win.customElements || typeof win.HTMLElement !== "function") return false;
  const ce = win.customElements;

  if (!ce.get(EDITOR_NAME)) {
    class WallPanelKitStrategyEditor extends win.HTMLElement {
      setConfig(config) {
        this._config = { ...config, ...normaliseConfig(config) };
        if (!this._config.area) delete this._config.area;
        this._render();
      }
      set hass(hass) {
        this._hass = hass;
        this._render();
      }
      _render() {
        if (!this._config) return;
        if (!this._form) {
          this._form = win.document.createElement("ha-form");
          this._form.computeLabel = (s) => LABELS[s.name] || s.name;
          this._form.addEventListener("value-changed", (ev) => this._changed(ev));
          this.appendChild(this._form);
        }
        this._form.hass = this._hass;
        this._form.schema = EDITOR_SCHEMA;
        this._form.data = { layout: DEFAULT_LAYOUT, ...this._config };
      }
      _changed(ev) {
        ev.stopPropagation();
        const value = (ev.detail && ev.detail.value) || {};
        const config = { ...this._config, ...value };
        const norm = normaliseConfig(config);
        config.layout = norm.layout;
        if (norm.area) config.area = norm.area;
        else delete config.area;
        this._config = config;
        this.dispatchEvent(
          new win.CustomEvent("config-changed", {
            detail: { config },
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
    ce.define(EDITOR_NAME, WallPanelKitStrategyEditor);
  }

  if (!ce.get(ELEMENT_NAME)) {
    class WallPanelKitStrategy extends win.HTMLElement {
      static async generate(config, hass) {
        return generateDashboard(config, hass);
      }
      static async getConfigElement() {
        return win.document.createElement(EDITOR_NAME);
      }
    }
    ce.define(ELEMENT_NAME, WallPanelKitStrategy);
  }

  win.customStrategies = win.customStrategies || [];
  if (!win.customStrategies.some((s) => s && s.type === STRATEGY_TYPE && s.strategyType === "dashboard")) {
    win.customStrategies.push({
      type: STRATEGY_TYPE,
      strategyType: "dashboard",
      name: "Wall Panel Kit (preview)",
      description: "The lights of one area as tiles, for a tablet or a phone.",
      documentationURL: "https://github.com/davidteles/ha-wall-panel-dashboard",
    });
  }
  return true;
}

if (typeof window !== "undefined") register(window);
