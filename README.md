# WS2811 / WS2812B Pixel Power Calculator

A web-based planning tool for Christmas pixel installations: power sizing, voltage drop, wire gauges, AC circuit distribution, and multi-bank controller allocation. Built around MeanWell power supplies and NEC continuous-load rules so what the tool recommends matches real-world electrical practice.

**Live:** https://silvester13-sos.github.io/pixel-power-calculator/

---

## What's New in This Revision

- **Verdict banner** at the top of every result — green / amber / red "does this design work" in plain English
- **Review blocks** under the banner: critical issues, cautions, and "what you got right" wins
- **Voltage-drop diagram** — inline SVG showing your actual DC chain (PSU → pigtail → extension → Pixel 1 → ... → Pixel N), with the injection branch when modelled
- **"Model my actual injection setup"** — choose whether injection comes from the same PSU's spare V+/V- pair, a dedicated PSU of the same model, or a different PSU
- **Real World Usage (RWU) slider on String Power** — see peak-white *and* realistic-show voltage drop side-by-side
- **Save Build as PDF** button on every tab (one click, dated filename, no print-dialog)
- **Beginner / Advanced Mode toggle** in the header — hides expert-only controls and shows only the fields most users need
- **Inline "why this matters" hints** under each sidebar field
- **4″ bullet-pixel spacing** is now the default on String Power (matches stock bullet-pixel harnesses)
- **Save progress + Reset** — inputs persist in your browser between visits; a **Reset to Defaults** button on each tab clears both the fields and the saved state (also fixes the browser-autofill ghosts a few users hit)

---

## Three Planning Modes

The tool has three top-level tabs. Pick whichever matches what you're planning.

1. **String Power Needs** — a single prop / port / string. Fastest path to "how big a PSU and how thick a wire do I need?"
2. **Controller Setup Power Needs** — multi-port, multi-bank controllers (Kulp K2 / K4 / K8 / K16 / K32 / K40, Falcon F16V5 / F48, Genius, Aldrick/Baldrick, QuinLED, generic). Allocates pixels to ports, ports to banks, banks to PSUs.
3. **Megatree Planner** — mega-tree geometry → strand lengths → pixels per strand → power. Handles cone / cylinder / custom taper, 12 to 180+ strands, optional high-wind mode.

All three tabs share the same results-layer features: verdict banner, review blocks, Save-as-PDF, Beginner Mode.

---

## Getting Started

1. Open the calculator in your browser (link above).
2. Pick a mode tab.
3. Enter your pixel count and the sidebar fields — the blue ⓘ icons and the gray hint text under each field explain what each one does.
4. Click **Calculate**.
5. Read the verdict banner first. Then the critical / caution / wins blocks. Then the detail cards and tables.

If you've used the tool before, the sidebar remembers your last values. Use the **Reset to Defaults** button under Calculate to start fresh.

---

## Mode 1: String Power Needs

Use this for one prop, one port, one run of pixels.

### Inputs — Pixel Setup

- **Pixel Supply Voltage** — 12V (bullet pixels, most Christmas use) or 5V (strip / matrix). An optional *Custom voltage* field lets advanced users enter the actual loaded voltage of their PSU (e.g. 13.20V on a trimmed LRS-350-12).
- **Pixel Construction** — *Resistor* (needs ≥11V for stable colour, most WS2811 bullet pixels) or *Regulated* (works down to ~9.5V on 12V, ~4.5V on 5V).
- **Number of Pixels** — count on this one prop or port.
- **Watts per Pixel at 100% White** — 0.6W is the WS2811 12V default (50 mA × 12V), 0.3W is the WS2812B 5V default.
- **Pixel Density / Spacing** — defaults to **4″ bullet-pixel spacing (stock bullet harness)**. Also offers 30 px/m and 60 px/m strip densities, plus Custom.
- **Brightness Level** — the max your show will actually run at. Most shows don't exceed 60–80%.
- **Real World Usage (RWU) Factor** — slider 20–100%, default 45%. Christmas sequences with colour variety average 25–45% of peak-white draw. Results show peak and RWU side-by-side so you can plan against the honest number instead of the worst-case one.

### Inputs — DC Wiring

- **Include Controller Pigtail** — short wire (1–3 ft) from controller/PSU enclosure. Check the box, then pick gauge. **18 AWG is the largest commercially-available Christmas pigtail**; 22 AWG is available but advanced-only.
- **Extension Wire Gauge + Length** — the main run from the controller/PSU to the first pixel. 12–14 AWG is typical for 10–30 ft runs.
- **Injection Wire Gauge** — gauge for your mid-run injection taps (18 AWG is typical).
- **Model my actual injection setup** (optional) — when on, lets you specify:
  - Pixels before first injection
  - Injection spacing (pixels between taps)
  - Injection cable length per tap
  - Injection power source: *Same PSU (spare V+/V- pair)*, *Dedicated PSU — same model*, or *Dedicated PSU — different model*
  - Tool then models the initial-push segment amperage correctly instead of assuming pigtail carries the full strand.

### Inputs — Power Supply, AC, Voltage Drop Graph

- **Power Supply Model** — MeanWell LRS/ELG/etc., filtered to match selected voltage
- **PS Derate Factor** — 80% (recommended), 90% (cool/ventilated), 100% (advanced, not recommended)
- **AC Safety Factor** — 80% (NEC 210.20 compliant), 90% (advanced — exceeds NEC), 100% (advanced — non-compliant)
- **AC Mains Voltage** — 120V (NA), 230V (Europe/UK/AU)
- **Circuit Breaker Rating** — 15A standard, 20A for utility/kitchen
- **Max Run Length to Graph** / **Min Acceptable Pixel Voltage** — bounds for the voltage-drop graph (advanced-only)

### Results

**Verdict Banner** — green "Design works," amber "works with cautions," or red "critical issues to fix" — plus a one-line sub-summary of your build.

**Review Blocks** (plain English):
- **Critical issues** — things you must fix before building
- **Cautions** — things to review but not blockers
- **What you got right** — wins, so you know what to keep

**Summary Cards** — Total Pixels, DC Power Required, AC Power Draw, Power Supplies, 15A Circuits Required, DC Feed Chain (voltage at Pixel 1).

**Voltage Drop Diagram** — inline SVG showing PSU → pigtail → extension → Pixel 1 → Pixel N with drop per segment at both peak and RWU. Dashed purple branch appears when injection is modelled.

**Tables** — Power Supply Specifications, AC Circuit Distribution, Power Injection Plan, Voltage-Drop Graph, DC Wire Gauge Reference.

---

## Mode 2: Controller Setup Power Needs

Use this when you're wiring a real controller with multiple ports and banks.

### Supported Brands & Models
Kulp (K2, K4, K8, K16, K32, K40 and A-series), Falcon (F16V5, F48, etc.), Genius, Aldrick / Baldrick, QuinLED, and a generic fallback.

The tool reads each controller's spec from its definition: total ports, ports per bank, max amps per port (typically 6A), max amps per bank (typically 24A), and uses those as hard limits in the warnings.

### Port Configuration Modes
1. **Uniform** — same pixel count on every port
2. **Per-Bank** — different per bank, uniform within each
3. **Per-Port** — individual pixel count for each port

### DC Wiring Options
- **PSU → Controller pigtail** — gauge + length, optional
- **Controller → Extension board** — gauge + length, optional (shows ampacity badge)
- **Extension → First Pixel** — always required

### Results

Same verdict / cautions / wins framework at the top, plus:
- **Per-Bank Power Breakdown** with per-port and per-bank limit checks, RWU-aware (amber if theoretical over but RWU OK, red if RWU also over)
- **Power Injection Map** (per-port mode) — exact injection points with voltage at each tap
- **PSU Allocation** — which PSUs feed which banks, with utilization %
- **AC Circuit Distribution** following NEC 80% continuous-load rule

---

## Mode 3: Megatree Planner

For planning a traditional mega-tree where strand length is derived from geometry.

### Geometry Inputs
- **Tree Height** (ft) and **Base Diameter** (ft)
- **Tree Shape** — Cone (default), Cylinder, or Custom Taper (specify top diameter)
- **Number of Strands** — presets from 12 (30° spacing) to 180 (2° spacing), or Custom
- **High Wind Mode** — turns on wind-speed input and emits structural recommendations for 20–50+ mph zones

### Pixel & Power Inputs
Same voltage, construction, watts, brightness, RWU controls as Mode 1, plus:
- **Pixels per Strand** — Uniform, or Auto-Calculate from seed-pixel spacing (2 cm ultra-dense → 10 cm sparse, or Custom)
- **Strand Slack / Connector Allowance** — 6" to 24" per strand for tension + connectors
- **Strand Feed Wire Gauge** — 12 AWG to 20 AWG (18 AWG typical for strand feeds)

### Results
Tree geometry summary, per-strand pixel counts and lengths, strand feed voltage drop, PSU count, AC circuit plan, and a visual representation of the tree.

---

## Shared UX Features

### Beginner Mode
Click the **Beginner Mode** pill in the header. The page hides advanced-only controls (custom voltage, 22 AWG pigtail, 100% PS derate, 90%/100% AC safety overrides, custom spacing, voltage-drop graph bounds, etc.) and shows a short banner explaining what's been simplified. Click again to return to Advanced Mode.

The tool opens in Advanced Mode by default. Beginner Mode is one click away for anyone who wants a cleaner view.

### Save Build as PDF
Every tab has a **Save Build as PDF** button at the top-right of the results. One click → dated PDF with everything (verdict, cards, tables, diagram). No print dialog, no cropping.

### Save Progress + Reset to Defaults
Your sidebar inputs auto-save to the browser's local storage as you change them, so closing and reopening the tab restores your build. Use the **Reset to Defaults** button under Calculate to clear that saved state and return to factory defaults.

This also turns off the browser's built-in form autofill — if you previously saw "stale" values that survived cookie clears or private windows, that's why. Reset (or clear browser form-data once) and the ghosts go away.

### Inline Field Hints
Every important sidebar field has a short gray hint underneath explaining what it means in plain English. The old ⓘ info buttons still open full tooltips with deeper detail.

---

## Technical Details

### Voltage Drop Formula
```
V_drop = I × R × 2 × L
```
Where *I* = amps, *R* = Ω/ft for the chosen gauge, *L* = feet, and the factor of 2 is round-trip (V+ and V- conductors).

### Wire Ampacity
NEC Table 310.15(B)(16), PVC insulation, 60°C, open-air copper. CCA (copper-clad aluminum) ratings also shown in the reference table — CCA has higher resistance and lower ampacity, use CU for critical runs.

### PSU Efficiency
MeanWell AC-input draw is computed as `DC_load / efficiency` (typically 88–92% depending on model and load).

### Real World Usage (RWU)
Christmas sequences with colour variety typically draw **25–45%** of theoretical peak-white. Static-white or video-playback sequences sit closer to 60–80%. The tool shows both peak (for safety planning and wire sizing) and RWU (for realistic PSU counts and voltage-at-pixel) so you don't over-build to a worst case that never happens on the lawn.

---

## Troubleshooting

**"Pigtail overloaded"** — 18 AWG is the largest commercially-available Christmas pigtail. If peak amperage exceeds 7A, you can't just upsize the pigtail. Shorten what this port drives, inject sooner, or split across multiple ports.

**"Extension wire overloaded"** — upsize the extension gauge (lower AWG number), reduce pixels on this run, or move injection closer to Pixel 1.

**"Bank EXCEEDS 24A limit"** — each bank has exactly one PSU connection; 24A is a hard limit. Redistribute pixels to other banks or reduce count.

**"Port EXCEEDS 6A limit"** — move pixels to another port on the same bank, or inject sooner.

**"Exceeds PS capacity"** — choose a larger MeanWell model, split the bank across two PSUs, or (if RWU is OK, amber warning) accept the risk if you're confident in the RWU factor.

**Voltage below minimum at Pixel 1** — your DC feed chain is losing too much voltage before the string. Upsize extension gauge, shorten the run, or add injection.

**Browser seems to remember old values** — click **Reset to Defaults** under Calculate. The tool now turns off browser form-autofill, but any leftovers from before this update will clear with Reset.

---

## FAQ

**Resistor vs regulated pixels?** Resistor needs ≥11V (12V) / ≥4.5V (5V) for stable colour; regulated works down to ~9.5V (12V) / ~4.5V (5V) and gives you more voltage-drop headroom.

**12V or 5V?** 12V for anything long (less drop, thinner wire gets away with more). 5V for dense strips and matrices.

**What's a safe RWU factor?** 45% (default) for typical colour-sequencing shows. Bump to 60–80% for static-white or video-playback. Drop to 25–35% only if you're confident your sequences never sustain high draw.

**Do I need injection?** Check the voltage at Pixel 1 and the "Remaining for strip injection" line. If that's going negative, yes. Generally anything over ~100 pixels benefits from at least one tap.

**What does "RWU OK" mean?** Theoretical peak-white exceeds a limit but realistic show load is fine. Amber warning — proceed if you trust your RWU factor matches your actual sequences.

**What does "RWU also over" mean?** Even the realistic load exceeds the limit. Red warning — must fix.

---

## Version History

### Current (2025 Christmas prep revision)
- 4-inch bullet-pixel spacing added as String Power default
- Browser autofill disabled; opt-in localStorage cache + Reset to Defaults button
- Save Build as PDF (jsPDF + html2canvas, CDN-loaded) on every tab
- Voltage-drop SVG diagram on String Power
- Beginner / Advanced mode toggle in header
- Inline "why this matters" field hints across sidebar
- Verdict banner + critical / cautions / wins review blocks
- "Model my actual injection setup" with Same PSU / Dedicated same / Dedicated different source choice
- Real World Usage (RWU) slider on String Power (20–100%, default 45%), with peak + RWU shown side-by-side

### Earlier
- Megatree Planner mode (geometry → strands → power)
- Controller Setup mode with per-bank, per-port, and uniform port configuration
- RWU-aware three-state warning system (danger / warn / ok)
- Multi-brand controller support (Kulp, Falcon, Genius, Aldrick/Baldrick, QuinLED)
- Voltage drop analysis, AC circuit distribution, injection mapping
- Initial release with basic string power and PSU sizing

---

## License

Provided as-is for planning Christmas / event LED pixel installations. Not a substitute for an electrician on anything that connects to mains or runs continuously at high load.

---

**Need help?** The **Help** link in the header returns to this guide. Inline ⓘ icons throughout the UI open deeper tooltips for each field. Feedback and bug reports: open an issue on the GitHub repo.
