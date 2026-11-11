# ACI DSIM research — November 10, 2026

Intermediate research for NightSweep; no device testing or manufacturer confirmation was performed.

## Sources verified at the manufacturer origin

| ID | Source | Revision/date | Pages used |
|---|---|---|---|
| SG | [DSIM-SG Installation Guide](https://acicomms.com/wp-content/uploads/2021/04/04.-DSIM-SG-TechManual-Rev-H-210408b.pdf) | H, 04-08-2021 | 2, 4–11, 14–17 |
| APP | [DSIM Android/iOS App Guide](https://acicomms.com/wp-content/uploads/2021/03/11.-DSIM-App-Manual-Rev-B-210324.pdf) | B, 03-24-2021 | 3, 6–13 |
| DATA | [DSIM data sheet](https://acicomms.com/wp-content/uploads/2022/08/10.-DSIM-Data-sheet-Rev-AB-220817.pdf) | AB, 08-17-2022 | 2, 9, 16, 19 |
| ASEM1 | [ASEM GainMaker 1002 MHz data sheet](https://acicomms.com/wp-content/uploads/2021/05/33.-ASEM-CISCO-GM-DataSheet-Rev-AA-210519.pdf) | AA, 05-19-2021 | 1, 3, 12 |
| ASEM12 | [ASEM GainMaker 1218 MHz data sheet](https://acicomms.com/wp-content/uploads/2023/09/03.-ASEM-CISCO-GM-DataSheet-1.2G-Rev-K-230929.pdf) | K, 09-29-2023 | 2–3, 10 |
| WEB | [Current DSIM product page](https://acicomms.com/dsim/) | Undated; retrieved 2026-11-10 | DSIM-SG and App sections |

## DSIM-SG workflow summary (SG, under 200 derived words)

Select DSIM-SG only after identifying the actual RF module. In S1 manual position 2, obtain maximum gain then apply the documented backoff: 3.2 dB at 547 MHz, 4.1 dB at 750 MHz, or 4.6 dB at 870 MHz. Change S1 to position 3, start with a 0 dB AGC pad, and set design input/output levels. Connect the controller through cable 240330-01. Confirm solid-blue MGC before alignment. Press Mode once; allow about 45 seconds and verify blinking-blue AGC and the intended pilot. Do not leave an unsuccessful alignment in fallback.

Documented pilot channels are 52–142: digital centers 393–903 MHz. Digital channel 110 is 711 MHz; 303 MHz is outside this table. Do not infer OFDM PLC support from QAM support. Thermal settings are 9/18/27 dB; pedestal/underground thermal operation is discouraged.

Conflicts require review: p9 lists 24 V/21.5–26.5 V; p10 labels 40°F as −4.4°C in one temperature row. Neither value should become an automatic threshold. Consult pp10–11 for temperature and fallback adjustments rather than inventing interpolation.

## Mobile app and supervisor codes (APP)

The guide specifies DSIM-DONGLE-02 Bluetooth 4.0. Record module serial number and firmware from Information before setup. Setting exposes MGC/AGC/TGC. User Pilot accepts an encrypted pilot-channel key supplied by the manager/supervisor (p11); the app saves an entered key. The documented preset is channel 88 QAM. AGC completion must finish before closing the app.

No universal supervisor code or public per-channel key table was verified. Searches of original ACI materials and broader web results found instructions to obtain the key, not the key itself. Do not convert 88, 609 MHz, a channel number, or a screenshot sample into a supervisor password. A NightSweep setup can explain where to enter an approved key in ACI's app and track whether it was obtained; it cannot supply a verified code yet.

The manufacturer app's AGC Prep +/- controls adjust attenuation, while physical controller +/- descriptions concern output level. Do not present these signs as interchangeable. MAX/MIN are range-finding controls. Record operating voltage, ripple, temperature and log interval where available.

## Variant and specification findings (DATA)

DSIM-SG is the GainMaker-compatible family. DSIM-SS is a different family for Scientific Atlanta System II/III, including separate 24 V and 12 V variants. DSIM-A 1218 MHz is also distinct. DATA p9 lists SG: single-pilot control, 6 MHz channel bandwidth, QAM/NTSC/CW, 10 dB maximum control range, ±0.5 dB accuracy, 9/18/27 dB thermal choices, 15 V typical (14–16 V), 110 mA maximum, and 3 W maximum. The stated asymmetric compensation condition and maximum range should remain separate fields, not be reconciled by arithmetic.

DATA p16 explicitly lists these 1002 MHz GainMaker part numbers: HGD 7006936/7006586/7014161/7014162; balanced triple 7006938/7006942/7014163/7014164; unbalanced triple 7006939/7006943; low-gain dual 7006937/7006941; LE 7006952/7006590. Confirm installed part number; do not generalize to every GainMaker generation. Cable 240330-01 connects SG to controller or dongle (p19).

The voltage conflict with SG p9 is unresolved. NightSweep should display the conflict, preserve measured voltage, and require the installed module label or ACI confirmation before applying voltage acceptance criteria.

## GainMaker housing does not identify the DSIM variant

- ASEM1 documents DSIM-SG in its 1002 MHz GainMaker upgrade modules. This is separate RF equipment from stock Cisco modules; do not reuse stock gain data.
- ASEM12 documents DSIM-A in 1218 MHz GainMaker upgrade modules, with 48 dB HGD/BT forward gain and 42 dB LE forward gain at 1218 MHz with AGC; return gain is 28 dB. These values must not be applied to ASEM1 or stock Cisco equipment.
- WEB currently describes DSIM-SG for GainMaker 750–1002 MHz; it links DATA and APP. This does not establish support for AOI Quantum18 or Vecima modules.

## Recommended implementation decisions

1. Add an optional ACI DSIM setup path to applicable GainMaker equipment, with the exact module variant/part number and firmware captured first.
2. Keep manufacturer guidance and job launch/pilot targets visibly distinct. Never silently replace the job pilot with the manufacturer preset.
3. Provide direct manual links with revision and page anchors. Show an offline summary while making clear that opening the online original needs a connection.
4. For supervisor key, state “Obtain the approved pilot key from your supervisor or ACI.” No verified code is available for prefill. This is a source limitation, not a software restriction.
5. Do not imply NightSweep directly controls or connects to DSIM hardware unless separately implemented and tested.

## Search reference IDs for parent verification

SG: turn1view0 / turn4view0. APP: turn4view1 / turn5view2. DATA: turn4view2 / turn5view3. ASEM1: turn10view1. ASEM12: turn9view0. WEB: turn3view1. Parent must open any source before citing its web reference. PDF screenshot calls returned only text placeholders through this connector, so no image-only key was verified.
