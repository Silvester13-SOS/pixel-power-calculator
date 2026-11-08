# Show Planner — v0 Design Doc

**Status:** pre-coding design doc, not yet implemented
**Lives at (eventually):** `beta/show-planner.html` — unlinked from `index.html` until it's ready for the main site
**Author:** iteration between user (Sept Christmas builder) and Claude (2026-11-08)

---

## 1. What this is

A fourth planning mode (alongside String Power, Controller Setup, Megatree) that captures the **entire show's electrical path** and renders it as a single blueprint:

```
AC Circuits  →  PSUs  →  Controllers  →  Ports  →  Props
```

**Explicitly not:**
- A replica of xLights
- A yard-layout / scale drawing of where things sit on the lawn
- A prop database (that's a future enhancement with an external API)
- A null-pixel modelling tool (future)

**Explicitly yes:**
- An electrical schematic / blueprint
- Site-wide power math (AC load %, PSU utilization, bank utilization, voltage at each prop)
- Site-wide critical / cautions / wins block
- JSON save/load so users don't re-enter their site every visit
- PDF export of the whole blueprint

---

## 2. Scope (v0)

### In scope

- **AC Circuits** — user-named (e.g. "Garage East Side 2nd outlet"), 15A or 20A, 120V default (230V optional), NEC 80% derate applied
- **PSUs** — chosen from the existing `PS_MODELS` library; assigned to a circuit
- **Controllers** — chosen from the existing `CONTROLLERS` library; label for recognition ("East Side Controller #1")
- **Port assignments** — which PSU feeds which bank(s); which port feeds which prop
- **Props** — generic shape type + pixel count + voltage + watts/pixel + string wire gauge + extension gauge/length + optional short description ("snowflake on house")
- **Site-wide blueprint SVG** — stacked AC → PSU → Controller → Port → Prop hierarchy with utilization at every level
- **Save / Load** — JSON download + drag-import
- **PDF export**

### Out of scope (v0)

- Spatial yard layout
- Prop pixel-count database / API integration
- Null/sacrificial pixel accounting
- Multi-site / multi-year storage
- Drag-and-drop canvas editing (tabular inputs + "Generate Blueprint" button is enough)
- Injection at the show level (we'll accept injection as a per-prop attribute, but we won't try to merge injection PSUs across props — v1 problem)
- Non-MeanWell PSUs (only models already in `PS_MODELS`)

---

## 3. Data schema

### 3.1 Site envelope (save/load format)

```json
{
  "schemaVersion": 1,
  "tool": "pixel-power-calculator-show-planner",
  "savedAt": "2026-11-08T14:32:00Z",
  "site": {
    "name": "My Christmas Show 2026",
    "notes": "Free text — user's description of the overall show",
    "circuits": [ /* AcCircuit[] */ ],
    "psus":     [ /* Psu[] */ ],
    "controllers": [ /* Controller[] */ ],
    "props":    [ /* Prop[] */ ]
  }
}
```

The envelope separates `schemaVersion` + `tool` metadata from the `site` payload so we can version-migrate without breaking old saves.

### 3.2 Entity definitions

```ts
// IDs: short random string ("c_a7f3"), stable across edits, assigned on create.

type AcCircuit = {
  id: string;                  // "c_xxxx"
  name: string;                // "Garage East Side 2nd outlet"
  amperage: 15 | 20;           // breaker rating
  voltage: 120 | 230;          // mains voltage
  derate: 0.8 | 0.9 | 1.0;     // NEC 210.20 continuous-load factor
  notes?: string;
};

type Psu = {
  id: string;                  // "p_xxxx"
  modelKey: string;            // key into PS_MODELS: "lrs350", "lrs200_12", etc.
  circuitId: string;           // which AC circuit feeds it
  label?: string;              // optional — e.g. "PSU #1 (North yard)"
  derate: 0.8 | 0.9 | 1.0;     // derate applied to PSU nameplate watts
};

type Controller = {
  id: string;                  // "ct_xxxx"
  brandKey: string;            // "kulp", "falcon", "genius", "aldrick", "quinled"
  modelKey: string;            // key under that brand: "k32max", "f48", etc.
  label?: string;              // e.g. "East Controller #1"
  bankPsu: Record<number, string>;  // bank index (0-based) → PSU id
  // Bank → PSU is many-to-one: multiple banks on one controller can share a PSU
  // if the combined load fits. Null/undefined bank entry = unassigned.
};

type PortAssignment = {
  controllerId: string;
  portIndex: number;           // 0-based port number on the controller
  propId: string;
};

type Prop = {
  id: string;                  // "pr_xxxx"
  type: PropType;              // enum below
  description?: string;        // "Snowflake on house", "North mega-tree", etc.
  pixelCount: number;
  voltage: 5 | 12;
  wattsPerPixel: number;       // 0.60 default at 12V, 0.30 at 5V
  stringGauge: 10|12|14|16|18|20|22;   // default 22
  extensionGauge: 10|12|14|16|18|20;   // default 18
  extensionLengthFt: number;
  // Which controller port(s) feed this prop:
  ports: { controllerId: string; portIndex: number; pixels: number }[];
  // (If a prop spans multiple ports, pixels are distributed per entry.)
  injection?: {
    enabled: boolean;
    firstInjectionAfterPixel: number;
    spacingPixels: number;
    cableGauge: 10|12|14|16|18|20;
    cableLengthFt: number;
  };
};

type PropType =
  | 'tree'        // conical outline w/ vertical strand lines
  | 'spike'       // vertical pole, bullet pixels along it
  | 'star'        // 5-point star outline
  | 'snowflake'   // 6-arm radial
  | 'spinner'     // ring/wheel
  | 'candycane'   // C-shape / hook
  | 'arch'        // half-circle
  | 'matrix'      // grid rectangle
  | 'flood'       // single-node solid dot
  | 'strand'      // horizontal or diagonal line
  | 'generic';    // labelled rectangle fallback
```

### 3.3 Example tiny site (sanity check)

```json
{
  "schemaVersion": 1,
  "tool": "pixel-power-calculator-show-planner",
  "savedAt": "2026-11-08T14:32:00Z",
  "site": {
    "name": "Demo site",
    "circuits": [
      { "id": "c_1", "name": "Garage outlet #1", "amperage": 20, "voltage": 120, "derate": 0.8 }
    ],
    "psus": [
      { "id": "p_1", "modelKey": "lrs350", "circuitId": "c_1", "label": "North PSU", "derate": 0.8 }
    ],
    "controllers": [
      { "id": "ct_1", "brandKey": "kulp", "modelKey": "k32max", "label": "North Ctrl",
        "bankPsu": { "0": "p_1", "1": "p_1" } }
    ],
    "props": [
      { "id": "pr_1", "type": "tree", "description": "Front mega-tree",
        "pixelCount": 800, "voltage": 12, "wattsPerPixel": 0.60,
        "stringGauge": 22, "extensionGauge": 14, "extensionLengthFt": 25,
        "ports": [ { "controllerId": "ct_1", "portIndex": 0, "pixels": 800 } ] },
      { "id": "pr_2", "type": "snowflake", "description": "Snowflake above door",
        "pixelCount": 100, "voltage": 12, "wattsPerPixel": 0.60,
        "stringGauge": 22, "extensionGauge": 18, "extensionLengthFt": 12,
        "ports": [ { "controllerId": "ct_1", "portIndex": 4, "pixels": 100 } ] }
    ]
  }
}
```

---

## 4. Prop-type icon list

Each prop type renders as a schematic SVG primitive in the blueprint — not a scale drawing, just enough for the user to recognize what's what. All icons are roughly 60×60 px with the prop's description and pixel count labelled next to them.

| Type | Icon sketch (schematic) | Notes |
|---|---|---|
| **tree** | Triangle outline with 3–4 vertical lines inside | "Mega-tree / pixel tree" |
| **spike** | Vertical rectangle with evenly spaced dots down its length | Garden spikes, pathway stakes |
| **star** | 5-point star outline | Roof star, tree-topper |
| **snowflake** | 6 radial arms from a center point, each with 2–3 branch stubs | Any radial snowflake |
| **spinner** | Circle outline with an inner cross / spokes | Pinwheels, spinning wheels |
| **candycane** | "J" / hook shape | Candy canes, pathway hooks |
| **arch** | Half-circle / semi-ellipse outline | Pathway arches |
| **matrix** | Small grid rectangle (dots in a 4×4 pattern) | Pixel matrices, P-panels |
| **flood** | Solid filled dot (single-node emphasis) | Floods, single-node spots |
| **strand** | Horizontal line with dots along it | Eave line, roofline, perimeter |
| **generic** | Rounded rectangle with the description text inside | Fallback / unusual props |

All icons:
- Monochrome stroke on the blueprint (black on paper-white background, blue on dark background)
- Pixel count rendered to the right of each icon
- Voltage badge (12V / 5V) above the icon
- Status dot (green/amber/red) in the top-left of each icon based on that prop's power/voltage health

---

## 5. Blueprint SVG layout

### 5.1 Hierarchy and columns

The blueprint reads **top-to-bottom** in five bands:

```
┌─────────────────────────────────────────────────────────────────┐
│  BAND 1: AC Circuits                                            │
│  [circuit box] [circuit box] [circuit box]                      │
├─────────────────────────────────────────────────────────────────┤
│  BAND 2: PSUs                                                   │
│  Each PSU is drawn under its feeding circuit, with a vertical   │
│  line connecting them.                                          │
├─────────────────────────────────────────────────────────────────┤
│  BAND 3: Controllers (with bank subdivisions)                   │
│  Each controller is drawn under the PSU(s) that feed its banks. │
│  Banks are visible as sub-cells inside the controller box.      │
├─────────────────────────────────────────────────────────────────┤
│  BAND 4: Ports                                                  │
│  Each port is a small cell under its parent bank.               │
│  Lines extend down to the attached prop icon.                   │
├─────────────────────────────────────────────────────────────────┤
│  BAND 5: Props                                                  │
│  Prop icon + description + pixel count + voltage badge + status │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Per-level utilization display

Every box/cell shows its own badge:

- **Circuit box:** `"18.2A / 16.0A (114%) ⚠"` — amps used vs. derated breaker capacity (20A × 0.8 = 16A)
- **PSU box:** `"245W / 280W (87%) ✓"` — watts used vs. derated PSU rating
- **Controller bank cell:** `"22.1A / 24A (92%) ✓"` — current vs. bank limit
- **Port cell:** `"5.2A / 6A (87%) ✓"` — current vs. per-port limit
- **Prop icon:** status dot colored by the worst of (voltage at pixel 1, injection needed?, ampacity on its string)

All utilization uses **100% white worst case** (consistent with the Controller Setup safety overhaul from `418dca0`).

### 5.3 Color coding

- **Green** — within limits, within budget
- **Amber** — over at peak but within safe-RWU window, OR over by <10%
- **Red** — over at worst case AND must fix

### 5.4 Connections

- Vertical lines between bands show electrical path
- Multiple banks sharing one PSU → one PSU box fans out to multiple bank cells
- One prop spanning multiple ports → the prop icon receives lines from each port cell

---

## 6. Site-wide results panel

Below the blueprint SVG:

### 6.1 Summary cards (top row)

- Total pixels
- Total DC watts (worst case / show setting / RWU — matching the three-column pattern from Controller Setup)
- Total AC watts (DC ÷ efficiency)
- # Circuits used
- # PSUs
- # Controllers
- # Props

### 6.2 Critical / Cautions / Wins block

Same framework as the existing tabs, aggregated across the entire site:

- **Critical:** "Circuit 'Garage outlet #1' exceeds 16A continuous limit (18.2A at worst case)"
- **Cautions:** "PSU 'North PSU' is at 92% derated capacity — one stuck effect leaves no headroom"
- **Wins:** "All 8 banks on Kulp K32 Max stay under 24A at worst case — good distribution"

### 6.3 Per-prop breakdown table

| Prop | Controller / port | Pixels | Watts (worst) | Voltage at P1 | Injection? | Status |
|---|---|---|---|---|---|---|
| Front mega-tree | North Ctrl / P0 | 800 | 480W | 10.8V | Required @ px 130 | ⚠ |
| Snowflake above door | North Ctrl / P4 | 100 | 60W | 11.4V | OK | ✓ |

### 6.4 Build Interpretation block

Same voice as the Controller Setup block from `418dca0`:

> *A typical show at this scale (3,200 pixels, 2 circuits, 1 controller) would plan for:*
> - 4 × LRS-350-12 PSUs if run at 100% white worst case (your current count: 3 — borderline)
> - 20A circuits for both outlets (your plan: one 20A, one 15A — the 15A is near its limit)
> - Mid-string injection on any prop over ~120 pixels
> - Dedicated extension runs ≥14 AWG for anything over 15 ft

---

## 7. Save / Load / Export

### 7.1 Save (JSON download)

Button: **"Save site (.json)"** → downloads `my-christmas-show-2026.json` using the envelope from §3.1. Filename uses `site.name` (slugified) + current date.

### 7.2 Load (drag or file picker)

- Drag `.json` onto a drop zone at top of the Show tab, OR
- "Load site (.json)" button opens a file picker
- Schema version is checked; if newer than the tool supports, show a warning
- Autosave to `localStorage` on every change (same pattern as the existing tabs' Save-Progress feature) so a browser crash doesn't lose work

### 7.3 Reset

**"New site"** button clears state and loads a minimal starter site (1 circuit, 0 PSUs, 0 controllers, 0 props).

### 7.4 PDF export

**"Save Build as PDF"** — same `jsPDF + html2canvas` pipeline the other tabs already use. Captures summary cards + blueprint SVG + results panel + per-prop table.

---

## 8. UI pattern

Single-page accordion inside the Show tab (not a wizard). Four sections visible by default:

1. **AC Circuits** — table with "+ Add Circuit" button. Rows editable in-place.
2. **PSUs** — table with "+ Add PSU" button. Model dropdown + circuit dropdown per row.
3. **Controllers** — card per controller. Brand dropdown → model dropdown → bank → PSU table.
4. **Props & Port Assignments** — card per prop with type / pixels / voltage / wiring / port assignment table.

Bottom: **"Generate Blueprint"** button → renders §5 SVG + §6 results panel.

All inputs persist to `localStorage` on change. Blueprint re-renders on click (not on every keystroke — too expensive for larger sites).

---

## 9. Open questions (need user sign-off before coding)

1. **Multi-prop per port** — can two props share a port (daisy-chained on the same data line)? Or strictly one-prop-per-port in v0?
   - *Default if no answer:* one-prop-per-port. Users with daisy-chains can represent them as one logical "prop" with the combined pixel count.

2. **Multi-port per prop** — the schema supports this (a prop's `ports[]` array). Is this worth v0 complexity, or should a 1000-pixel mega-tree that's split across 4 ports be entered as 4 separate "prop" entries?
   - *Default if no answer:* support multi-port in schema (already drafted), but UI defaults to single-port mode with an "add port to this prop" link.

3. **Pigtail inside the controller** — the current Controller Setup tab has an optional PSU→controller pigtail. Do we model that in Show v0 or assume negligible?
   - *Default if no answer:* skip in v0 (negligible on short runs); add field on the controller row in v1.

4. **230V support** — the existing tabs support 230V EU mains. Show v0 defaults to 120V but should 230V be first-class or hidden under "advanced"?
   - *Default if no answer:* 120V default, 230V available via radio on each circuit (not hidden).

5. **Injection modeling** — show injection as a per-prop attribute (schema already does this). Should the blueprint SVG draw injection branches off each prop that has them, or just note them in the per-prop table?
   - *Default if no answer:* note in the per-prop table in v0; add branch drawing in v1 once the main hierarchy is proven readable.

6. **Save file portability** — should saved `.json` files be shareable between users (e.g. so someone can post their site for feedback)? If yes, we may want to strip local-only fields and version-stamp more carefully.
   - *Default if no answer:* yes, portable by default. Schema versioning + no local-only fields.

7. **Starter templates** — when a user clicks "New site," do we seed anything (e.g. "typical small show: 2×20A circuits, 2×LRS-350, 1×K16, 4×generic props") or start fully empty?
   - *Default if no answer:* start empty — a user's first instinct is usually to copy their real setup, not customize a template.

8. **Scale ceiling** — what's the biggest site we reasonably need to support? Someone running 50+ controllers has needs the blueprint SVG probably can't satisfy readably.
   - *Default if no answer:* target 1–5 controllers, 10–30 props, 2–8 PSUs, 2–6 circuits. Note the ceiling in the tool. Big-show users can still use the existing Controller Setup tab per controller.

---

## 10. Implementation phases

**Phase 0 (this doc):** schema + layout + open-questions sign-off. ← **we are here**

**Phase 1:** `beta/show-planner.html` scaffolding — tab skeleton, sections, JSON save/load, no blueprint yet.

**Phase 2:** data entry working end-to-end. Add circuits/PSUs/controllers/props. All entities persist, round-trip through JSON.

**Phase 3:** calculation engine — per-level utilization, per-prop voltage drop, aggregated critical/cautions/wins.

**Phase 4:** blueprint SVG renderer.

**Phase 5:** PDF export, polish, prop icons rendered as real SVG primitives.

**Phase 6:** promote `beta/show-planner.html` to the main tab bar in `index.html`.

---

## 11. Not committed to code yet — awaiting user sign-off on §9

Once the open questions in §9 are decided, we move to Phase 1.
