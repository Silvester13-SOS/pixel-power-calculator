# WS2811 / WS2812B Pixel Power Calculator

A comprehensive web-based calculator for planning power requirements, wire sizing, and circuit distribution for LED pixel installations. Supports both simple string calculations and advanced controller-based planning with MeanWell power supplies and NEC wire sizing standards.

## Features

- **Two Calculation Modes:**
  - **String Power Needs** - Calculate power requirements for basic pixel strings
  - **Controller Power Planning** - Advanced planning for multi-bank controllers (K2, K4, K8, K16, K32, K40)

- **Comprehensive Power Analysis:**
  - DC and AC power calculations
  - Real-World Usage (RWU) factor for realistic power estimates
  - Power supply sizing with MeanWell PS models
  - AC circuit distribution planning
  - Power injection planning and wire gauge recommendations

- **Voltage Drop Analysis:**
  - PSU-to-Controller wire drop
  - Controller-to-Extension board wire drop
  - Extension-to-First-Pixel wire drop
  - Visual voltage drop chart
  - Minimum voltage warnings for pixel types

- **Multi-Bank Controller Support:**
  - Per-bank power breakdown
  - Per-port power analysis
  - Bank limit warnings (24A max per bank)
  - Port limit warnings (6A max per port)
  - Optimal PSU-to-bank allocation
  - Power injection mapping for each string

## Getting Started

### Quick Start

1. Open the calculator in your web browser
2. Select a calculation mode:
   - **String Power Needs** for simple installations
   - **Controller Power Planning** for complex multi-controller setups
3. Enter your pixel configuration
4. Review the calculated results and recommendations

## Mode 1: String Power Needs

This mode is ideal for calculating power requirements for basic pixel strings.

### Input Settings

#### Pixel Configuration
- **Voltage**: Choose 12V (WS2811 resistor/regulated) or 5V (WS2812B regulated)
- **Pixel Type**:
  - **Resistor** - Uses resistors for voltage regulation (needs ≥11.0V for 12V pixels)
  - **Regulated** - Uses onboard voltage regulators (can operate down to ~9.5V)
- **Watts per Pixel**: Power consumption per pixel at full white (typical: 0.60W for 12V, 0.30W for 5V)
- **Brightness**: Planned maximum brightness (0-100%)
- **RWU Factor**: Real-World Usage factor (45-100%) - accounts for typical usage being less than full white at max brightness
  - 80% is a good default for most installations
  - 60-70% for displays with varied colors
  - 90-100% for installations that use full white frequently

#### String Configuration
- **Total Pixels**: Number of pixels in your string
- **Pixel Density**: Spacing between pixels (determines injection interval)
  - Standard densities: 4", 6", 8", 12"
  - Custom spacing available

#### DC Wiring
- **PSU→First Pixel Wire (Pigtail)**: Optional wire from power supply to first pixel
  - Enable checkbox to configure
  - Select wire gauge (10 AWG - 22 AWG)
  - Enter wire length in feet
- **Extension Wire (Ext)**: Wire from controller/injection point to first pixel
  - Select wire gauge (10 AWG - 22 AWG)
  - Enter wire length in feet

#### Power Injection
- **Injection Wire Gauge**: Wire gauge for power injection runs (10 AWG - 22 AWG)
- **Reduces PSU Load**: When checked, assumes power injection reduces load on main PSU
  - Useful when injection power comes from separate sources
  - Uncheck if all injection power comes from the same PSU

#### Power Supply Settings
- **PS Model**: Select MeanWell power supply model
  - Options range from 25W to 480W
  - Automatically filtered based on selected voltage
- **PS Derate**: Safety factor for power supply sizing
  - 80% (conservative, recommended)
  - 90% (moderate)
  - 100% (max capacity, not recommended for continuous use)

#### AC Circuit Settings
- **AC Voltage**: Mains voltage (120V for US/Canada, 240V for Europe/UK/AU)
- **Breaker Amps**: Circuit breaker rating (typically 15A or 20A)
- **AC Safety**: NEC derating rule
  - 80% (standard NEC continuous load rule, recommended)
  - 100% (max capacity, only for non-continuous loads)

### Understanding Results

#### Summary Cards
- **Total Pixels**: Confirms your pixel count
- **DC Power Required**: Total DC power needed
  - Shows both theoretical max and RWU estimate
- **AC Power Draw**: AC power from mains (accounts for PSU efficiency)
- **Power Supplies**: Number and type of PSUs needed
- **15A Circuits Required**: Number of 15A AC circuits needed
- **DC Feed Chain**: Maximum voltage drop from PS to first pixel

#### Power Supply Specifications Table
- **Load per PS**: Power draw per supply
- **AC Draw**: AC current and wattage
- **Status**: OK or over capacity warning

#### AC Circuit Distribution Table
- Shows how PSUs should be grouped onto AC circuits
- Ensures circuits are not overloaded per NEC rules

#### Power Injection Plan Table
- Shows recommended injection points based on pixel spacing
- Maximum amps per segment
- Visual chart of voltage drop along the string

#### DC Wire Gauge Reference
- Comprehensive table showing safe ampacity for different wire gauges
- Based on NEC standards for PVC insulation at 60°C in open air
- Includes both copper (CU) and copper-clad aluminum (CCA) ratings

## Mode 2: Controller Power Planning

This mode provides advanced planning for pixel controllers with multiple banks and ports.

### Input Settings

#### Controller Selection
- **Brand**: Select controller manufacturer
  - Hanson (includes Pi-Hat models)
  - Falcon (includes F16V5, F48, etc.)
  - Generic
- **Model**: Select specific controller model
  - Automatically shows specifications:
    - Total ports
    - Ports per bank
    - Max amps per port (typically 6A)
    - Max amps per bank (typically 24A)

#### Pixel Configuration
Same as Mode 1 (Voltage, Pixel Type, Watts per Pixel, Brightness, RWU Factor)

#### Port Configuration Modes
Three ways to configure pixel distribution across ports:

1. **Uniform** - Same number of pixels on all ports
   - Enter pixels per port
   - Applies to all ports on controller

2. **Per-Bank** - Different pixel counts per bank, uniform within each bank
   - Each bank can have different pixel counts
   - All ports within a bank have the same count

3. **Per-Port** - Individual configuration for each port
   - Maximum flexibility
   - Configure each port independently

#### DC Wiring Options
- **PSU→Controller Wire (Pigtail)**:
  - Wire from each PSU to controller power input
  - Enable/disable via checkbox
  - Select gauge and length

- **Controller→Extension Board Wire**:
  - Wire from controller to external fuse/distribution board
  - Enable/disable via checkbox
  - Select gauge and length
  - Ampacity limit shown (20A for 12 AWG, 7A for 18 AWG, etc.)

- **Extension→First Pixel Wire**:
  - Wire from distribution point to first pixel
  - Always enabled
  - Select gauge and length

#### Minimum Voltage Display
Shows the minimum voltage requirement for selected pixel type and why:
- **Resistor pixels (12V)**: Need ≥11.0V for consistent color
- **Regulated pixels (12V)**: Can operate down to ~9.5V (regulator headroom)
- **5V regulated pixels**: Need ≥4.5V

#### Power Injection Settings
- **Pixel Density/Spacing**: Same as Mode 1
- **Injection Wire Gauge**: Wire gauge for power injection
- **Injection Reduces PSU Load**: Whether injection affects PSU calculation

#### Power Supply & AC Settings
Same as Mode 1

### Understanding Controller Results

#### Summary Cards
- **Controller**: Shows selected controller model
- **Total Pixels**: Total across all ports
- **Power Supplies Required**: Number and type of PSUs needed
- **AC Circuits Required**: Number of AC circuits needed
- **DC Wiring Drops**: Total voltage drop through wiring
  - Broken down by segment (PSU→Ctrl, Ctrl→Ext, Ext→Pixel)
  - Shows ampacity warnings if exceeded
- **Power Injection Needed**: Whether injection is recommended
  - Shows total injection points and wire needed

#### Per-Bank Power Breakdown Table
Critical table showing power analysis for each bank:

**Columns:**
- **Bank**: Bank number
- **Ports**: Port range (e.g., Ports 1-4)
- **Px/Port**: Pixels per port (may vary if per-port mode)
- **Total Pixels**: Sum for the bank
- **DC Amps**: Total current draw
  - Shows theoretical max
  - Shows RWU estimate in green
  - Shows max per port and RWU per port
- **DC Watts**: Total wattage
  - Shows theoretical max
  - Shows RWU estimate in green
- **Ext Drop (max)**: Voltage drop on extension wiring
  - Shows max drop voltage
  - Shows Ctrl→Ext drop (if enabled)
  - Shows Ext wire drop
  - Warning if exceeds wire ampacity
- **Bank Terminal Status**: **IMPORTANT** - Shows warnings
  - **Port limit warning**: If any port exceeds 6A limit
  - **Bank limit warning**: If bank exceeds 24A limit
  - Shows whether RWU is also over or within limits
  - Badge colors:
    - 🔴 Red (danger): Both theoretical AND RWU exceed limits
    - 🟡 Amber (warning): Only theoretical exceeds, RWU is OK
    - 🟢 Green (OK): Within all limits

**Example Status Messages:**
- `⚠ 10.00A/port EXCEEDS 6A limit — RWU OK (~5.50A)` - Amber warning
- `⚠ 40.00A EXCEEDS 24A bank limit — RWU OK (~22.00A)` - Amber warning
- Both warnings can appear together if both limits exceeded

#### Power Injection Map Table (Per-Port mode only)
Shows detailed injection planning for each string:
- Injection points along each string
- Voltage at each injection point
- Wire runs needed
- Visual color coding (green = good, amber = warning, red = critical)

#### PSU Allocation Table
Shows optimal grouping of banks onto power supplies:

**Columns:**
- **PSU #**: Power supply number
- **Banks Served**: Which bank(s) this PSU powers
- **DC Load**: DC current and wattage
  - Shows PSU load (accounts for injection if enabled)
  - Shows total wattage if different
  - Shows RWU estimate
- **PS Utilization**: Percentage of PSU capacity used
  - 🔴 Red: Overloaded (>100%)
  - 🟡 Amber: High (>90%)
  - 🟢 Green: OK
- **PSU→Ctrl Drop**: Voltage drop on pigtail wire (if enabled)
  - Shows ampacity warning if exceeded
- **AC Draw**: AC power consumption at mains
- **Status**:
  - `⚠ XXX.XW exceeds PS capacity — RWU OK (~XXX.XW)` if over capacity but RWU is fine
  - `⚠ XXX.XW exceeds PS capacity — RWU also over (~XXX.XW) — upgrade PS or split bank` if RWU also exceeds
  - Badge colors match severity (red/amber/green)

#### AC Circuit Distribution Table
Shows how PSUs should be distributed across AC circuits to comply with NEC rules.

## Tips and Best Practices

### Power Planning
1. **Use RWU Factor appropriately**:
   - Don't set too low or you'll over-provision
   - Don't set too high or you'll under-provision
   - 80% is a safe default for most installations

2. **Pay attention to bank limits**:
   - Each bank has only ONE power connection
   - Maximum 24A per bank
   - If bank exceeds 24A, you MUST reduce pixel count

3. **Watch port limits**:
   - Maximum 6A per port (controller limitation)
   - If port exceeds 6A, reduce pixels on that port
   - Even if RWU is OK, theoretical max matters for worst-case scenarios

4. **Amber vs Red warnings**:
   - 🟡 **Amber (soft warning)**: Theoretical max exceeds but RWU is OK
     - May be acceptable if you're confident in RWU factor
     - Consider as a "proceed with caution" situation
   - 🔴 **Red (hard warning)**: Both theoretical AND RWU exceed limits
     - MUST be fixed - reduce pixel count or reconfigure

### Wire Sizing
1. **Don't skimp on wire gauge**:
   - Voltage drop increases with longer runs and higher current
   - Use thicker wire (lower AWG) for long runs
   - Check the voltage drop warnings

2. **Minimum voltage matters**:
   - Resistor pixels need ≥11.0V for consistent colors
   - Keep total voltage drop under 1.0V for 12V systems
   - For 5V systems, keep drop under 0.5V

3. **Consider wire type**:
   - Copper (CU) is better than copper-clad aluminum (CCA)
   - CCA has higher resistance and lower ampacity
   - Use CU for critical runs

### Power Injection
1. **Injection is often necessary**:
   - Long strings (>100 pixels) usually need injection
   - Follow the injection map recommendations
   - Use appropriate gauge wire for injection runs

2. **Injection reduces PSU load**:
   - Enable "Injection Reduces PSU Load" if power comes from separate sources
   - Disable if all power (including injection) comes from same PSU

### AC Circuit Planning
1. **Follow NEC rules**:
   - Use 80% AC safety factor for continuous loads
   - Don't exceed breaker ratings
   - Distribute PSUs across multiple circuits if needed

2. **Plan for circuit availability**:
   - Ensure you have enough circuits available
   - Consider dedicated circuits for large installations

## Technical Details

### Voltage Drop Calculations
Voltage drop is calculated using:
```
V_drop = I × R × 2 × L
```
Where:
- I = current in amps
- R = resistance per foot (from wire gauge)
- L = length in feet
- 2 = factor for round-trip (positive and negative conductors)

### Wire Ampacity
Based on NEC Table 310.15(B)(16) for:
- PVC insulation
- 60°C temperature rating
- Open air installation
- Copper conductors

### Power Supply Efficiency
MeanWell power supplies have typical efficiencies of:
- 88-92% depending on model and load
- AC draw = DC load / efficiency

### Real-World Usage (RWU)
RWU factor accounts for:
- Not all pixels at full brightness simultaneously
- Color mixing (most patterns don't use full white)
- Typical usage patterns
- Safety margin already included in planning

## Troubleshooting

### "Port EXCEEDS 6A limit"
**Cause**: Too many pixels on one port
**Solution**:
- Reduce pixels per port
- Redistribute pixels to more ports
- If RWU is OK (amber warning), may be acceptable depending on your confidence in RWU factor

### "Bank EXCEEDS 24A limit"
**Cause**: Too many pixels on one bank (across all ports in that bank)
**Solution**:
- Reduce total pixels on the bank
- Redistribute pixels to other banks
- Each bank has only one PSU connection, so 24A is a hard limit

### "Exceeds PS capacity"
**Cause**: Power supply too small for the load
**Solution**:
- Choose larger PSU model
- Split banks across multiple PSUs
- If RWU is OK (amber warning), current PSU may be adequate for typical use

### High voltage drop warnings
**Cause**: Wire too thin or too long for the current
**Solution**:
- Use thicker wire (lower AWG number)
- Shorten wire runs if possible
- Add power injection points

### Voltage below minimum
**Cause**: Total voltage drop brings voltage below minimum for pixel type
**Solution**:
- Reduce voltage drop (thicker wire, shorter runs)
- Add power injection
- Consider switching to regulated pixels (lower minimum voltage requirement)

## Frequently Asked Questions

### What's the difference between resistor and regulated pixels?
- **Resistor pixels** use resistors for current limiting and need higher voltage (≥11.0V for 12V pixels) for consistent colors
- **Regulated pixels** use onboard voltage regulators and can operate at lower voltages (~9.5V for 12V pixels), providing more voltage drop margin

### Should I use 12V or 5V pixels?
- **12V**: Better for longer runs, less voltage drop, easier power injection, more wire gauge flexibility
- **5V**: Brighter pixels, tighter spacing, but more voltage drop concerns

### What's a safe RWU factor?
- **80%** is recommended for most installations
- **60-70%** for displays with lots of color variation
- **90-100%** only if you frequently use full white at max brightness

### How many power supplies do I need?
The calculator will tell you based on your configuration. Generally:
- Each bank can connect to one PSU
- PSUs should not exceed their rated capacity
- Consider future expansion when sizing

### What wire gauge should I use?
Depends on current and distance. Use the calculator's recommendations:
- Higher current or longer distance = thicker wire (lower AWG)
- Don't exceed wire ampacity ratings
- Check voltage drop warnings

### Do I need power injection?
Check the Power Injection Map table:
- If voltage drops below minimum before end of string, you need injection
- Generally recommended for strings >100 pixels
- More injection points = better voltage stability

### Why are there two warnings on my bank?
Your bank can exceed both:
1. **Port limit** (6A max per port) - individual port overload
2. **Bank limit** (24A max per bank) - total bank overload

Both need attention. The bank limit is particularly critical because each bank has only one PSU connection.

### What does "RWU OK" mean?
"RWU OK" means:
- Theoretical calculation at full white/max brightness EXCEEDS the limit
- Real-World Usage (with RWU factor applied) is within limits
- This is an amber warning - proceed with caution
- Ensure your RWU factor accurately reflects your actual usage

### What does "RWU also over" mean?
"RWU also over" means:
- Even with the RWU factor applied, you still exceed limits
- This is a red/danger warning
- You MUST reduce pixel count or reconfigure
- Not safe to proceed

## Support and Resources

- **NEC Standards**: [National Electrical Code](https://www.nfpa.org/NEC)
- **MeanWell Power Supplies**: [MeanWell USA](https://www.meanwell-web.com/)
- **Wire Ampacity Tables**: Based on NEC Table 310.15(B)(16)

## Version History

### Latest Version
- Added Real-World Usage (RWU) factor for realistic power estimates
- Improved bank and PSU status warnings with RWU awareness
- Three-state warning system (danger/warn/ok)
- Support for power injection-based PSU sizing
- Per-port power analysis and injection mapping

### Earlier Versions
- Initial release with basic power calculations
- Added controller support (K2, K4, K8, K16, K32, K40)
- Added voltage drop analysis
- Added AC circuit planning

## License

This project is provided as-is for use in planning LED pixel installations.

---

**Need Help?** Click the "Help" link in the header to return to this guide, or refer to the inline tooltips (ⓘ icons) throughout the calculator interface.
