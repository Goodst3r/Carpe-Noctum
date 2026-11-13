# Current update: review the app and simplify Routes and Sweep

Spencer requested this cleanup for the update already in progress on November 13, 2026. Include it before the release candidate is signed. Run the release gate again on the combined build. Keep the calculator tools available from their current entry points.

## One route view for planning and sweep

Open a job to its route. Show the node or launch active, the selected port, and the branches in order. Each route point shows its expected low and high levels when its RF inputs are known. Each active row shows the exact map **NAME**, selected leg, expected input and output, and a plain answer to **Can it make gain?** Tap the row to enter sweep readings and pad/EQ values inline. Keep the selected station and leg in view while entering or reviewing readings.

- **Expected levels.** Reuse the route engine and show its expected low/high input and output at the selected frequencies. Use the route's recorded launch levels, cable and passive losses, active configuration, and selected output. Keep measured values and target outputs separately labeled on the same row.
- **Gain check.** Reuse the existing gain budget. Compare required gain to available gain at both markers for the selected leg. Show **Can make gain**, **Short on gain**, or **Needs input**, with the limiting frequency and margin when available. Surface low reserve and output-limit results separately. If available gain is sufficient but output capability is unknown, say **Gain available · output limit unknown**. A nominal catalog reference alone cannot establish a pass. Explain a missing or unverified input in one line at the affected row.
- **Sweep readings.** Enter actual low/high input and output levels in dBmV for each applicable leg. Use the same frequencies shown on the route. Support an input shared by multiple outputs where the station has a common input and allow per-leg readings when needed. Keep Before and After values editable and allow saving an incomplete record. Where applicable, let the user identify the measurement plane and enter explicit test-point corrections. Compute measured gain only from comparable readings at matching frequencies.
- **Pads & EQs.** Put a compact editable section in the active row. Show the installed and changed pad/EQ values for the slots supported by the selected model and leg. For HGD this includes forward input, interstage, main/aux output, and applicable return and AGC positions. Enter values in dB and start with blanks. Use station-specific values.
- **Remove redundant navigation.** Make the route the normal path for expected levels, gain feasibility, readings and plug-in values. Remove separate page hops for those tasks. Move detailed traces, return setup and existing saved records out of the main route view. Preserve existing job and backup data.

## Low-split equipment selection

Keep the standard Cisco/Scientific Atlanta GainMaker 1 GHz models used in the 42/54 MHz plant, with the installed model selected per station. The photographed standard High Gain Dual (HGD) is one of those models. Remove unused GaN and GaAs (GaaS) amplifier variants and those variant choices from the low-split workflow, including new equipment pickers, route templates, calculator equipment lists, guides, and practice jobs.

The current catalog labels its 1 GHz 42/54 HGD entry “GaAs.” Check which existing entries actually represent the verified standard models before removing or consolidating choices. Present verified standard models by their standard model names and split. Keep a gain, loss, setup, or pad/EQ reference only where it matches that verified model. Treat uncertain station assignments as unverified. Preserve existing saved jobs and their original equipment records on open and export. Keep the separate AOI and Vecima workflows available.

## Map upload builds the route draft

Import a local PDF or image, including a marked-up PDF. Choose the launch node or active, output port and destinations. Read text, geometry and visible annotations and build an editable branch draft automatically. Raster recognition may be used locally for this map feature. Keep private maps out of the public repository.

Copy the exact **NAME** column to active labels. Retain TAG as a map reference and keep installed model as a separate field. Extract cable lengths and sizes, passive locations and ports, and active positions where legible. Use original walkout evidence for installed plant and apply the user's corrections about proposed or absent equipment. Flag unclear connections, cable construction, and installed models at the affected row. Keep confirmed sections usable. Display expected levels and gain results where the necessary path and data are supported.

## Walk through the entire app

Review every screen, tab, card, action, and navigation path on a phone and in the browser using actual work sequences. Start a job, import or open a route, check expected levels and gain, record sweep readings and pad/EQ values, then save, reopen and export it. Walk through the other installed workflows and the calculator tools too.

Remove user-facing screens, controls, and duplicate paths that do not support a field workflow. Put necessary detail where it is used and keep the main route view focused on the work at the station. Keep every calculator tool available. Record what was removed or consolidated and verify that remaining links, saved jobs, and exports still work.

## Acceptance checks

1. On a phone, open an imported route and see expected levels and the gain result for each supported active leg. Enter low/high input and output readings and pad/EQ values inline. Save and reopen the job with those values intact.
2. A verified input of 10 dBmV and target of 43 dBmV at one marker require 33 dB of net gain at the same planes. Available net gain of 31 dB shows a 2 dB shortfall. Verify both markers, plus a case where gain is available and the output limit is unknown.
3. An incomplete span, unverified model, missing gain curve or unavailable marker gives a specific reason at the affected route point. A draft link and a planned booster cannot generate a passing result. A raw test-point reading remains separate from the corrected port level.
4. A marked PDF creates a draft with the same exact NAME values as its schedule. Unclear crossings or cable changes appear as review items. A mixed-model route keeps each station's installed model. Use a synthetic fixture in the public test suite and the private HA0005 job for a field check.
5. New low-split jobs offer verified standard GainMaker models. Unused GaN and GaAs variant choices are absent across the workflow. A standard HGD is still selectable even if its prior catalog label said GaAs. Legacy jobs and exports retain their original equipment and values.
6. Complete the whole-app walkthrough on phone and browser. Verify removed or consolidated paths, confirm all calculator tools are reachable, and run the release gate against the final combined build before signing.
