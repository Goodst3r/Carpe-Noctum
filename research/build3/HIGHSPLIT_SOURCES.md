# High split and Remote PHY reference: sources and how they were checked

November 11, 2026 · Lane B (Claude) · build list item 17 (high-split / 1.8 GHz guide and R-PHY bring-up checklist) · code in `night-sweep/highsplit.js`, screen Test → High split

The build list says every step of item 17 cites an OEM document revision and that nothing is invented. **Vecima's installation, configuration and commissioning guides are behind its customer portal** (login), and no public Vecima commissioning procedure exists (`research/alpha17-equipment-refresh/node-manuals.md` found the same on November 10). So the R-PHY half is a reading aid built from the CableLabs specifications and an honest statement of the gap; it is **not** a Vecima bring-up checklist. See Question 0 in `handoff_docs/lanes/claude-status.md`.

## How it was researched

Four research agents (Exa; Firecrawl was out of credits) each returned claims with the document, printed revision, locator, a short quote and whether the full text or only a snippet was read. A second agent per topic then tried to re-fetch every claim and gave a verdict. The first verification pass hit a usage limit and was rerun. **I did not read these PDFs myself**; the full-text reads and the re-checks were by agents, and the registry rows say so. Where a verdict was "could not verify" the statement is not on the screen.

## What is on the screen, and where it came from

| Used for | Document and issue | Read | Verdict |
| --- | --- | --- | --- |
| DOCSIS 4.0 FDD band edges (sub-split, mid-split, high-split, ultra-high splits) | CM-SP-PHYv4.0 **I08, September 28, 2026**, section 7.3.2, Table 29 (p. 109), Table 31 (p. 111), Figure 29 | full text | verified (one correction folded in: the sub-split edges are ranges) |
| DOCSIS 3.1 modem band edges | CM-SP-PHYv3.1 **I20, April 19, 2023**, sections 7.2.1, 7.2.3, 7.2.4, Table 4 | full text (to section 7.4.12) | verified |
| SCTE 300 2024 | *Best Practices for Migrating to DOCSIS 4.0*, single release December 2, 2024 | full PDF (CableLabs library copy) | verified: it defines no band edges and reproduces tables from PHYv4.0 I06 |
| SCTE 294 2024r1 | *Understanding and Troubleshooting Cable Upstream RF Spectrum* | **catalog page only** | verified as a catalog entry; its content is not used |
| Aeronautical band inside a 204 MHz upstream; OUDP approach; test region | SCTE-ISBE EXPO 2020 paper (Arcom copy) and the 2021 SCTE paper (Coldren, Cooper, Tresness) | full text | verified (locator corrections folded in) |
| Maker's view of four high-split leakage options | VIAVI web page, undated | full page | verified; labeled a maker's position |
| CCAP leakage test interface | CM-SP-CCAP-OSSIv3.1 **I30, April 29, 2026**, section 9.4 | **contents list and revision history only** | verified for the heading; the requirement text is not read and not used |
| FCC rules | 47 CFR 76.610 (Cornell LII and govinfo; the eCFR page did not load), 76.611, 76.614, 76.616 (eCFR, read November 11, 2026) | full text | verified (76.611 correction: 225–400 MHz too, and no more than 12 months between tests) |
| R-PHY bring-up order | CM-SP-R-PHY **I22, August 19, 2026**; CM-SP-R-DEPI **I18, August 26, 2026**; CM-SP-R-DTI **I08, March 23, 2020**; CM-SP-R-OOB **I15, August 26, 2026**; CM-SP-R-OSSI **I23, June 11, 2025** | selected sections | steps 1, 2, 6, 7 and 8 verified in the cited issue; **steps 3, 4 and 5 (address, time, control connection) were read in earlier issues (I17, I18) and the same section numbers are in I22's contents list; the screen says so in each locator** |
| Vecima | support page ("Product Documentation": guides, manuals and release notes are in the Customer Portal); EN9000 brief, September 2026 | pages | verified; the brief is a datasheet, not a procedure |
| Other makers' public guides, listed only | Cisco RPD LED page (Updated August 13, 2018), Cisco GS7000 2x2 RPD quick start (Sept 28, 2018 per Cisco's list), Cisco 2x2 RPD installation guide (first published February 28, 2019), Teleste DAN3 manual (Revision 008, 2023, a distributor copy), Harmonic Ripple-2 installation guide (Cert. Revision A, marked DRAFT, ManualsLib copy) | key pages | verified; their LED meanings are **not** reproduced because they are those makers' own hardware |

## Deliberately left off the screen

- **Verification "could not verify"** (not used): the RPD state names in R-PHY Annex B (top-level, authentication, aux-core states), the PTP timing details of R-PHY section 6.9 (timers, result names, holdover behaviour) and the claim that a core may hold an RF channel off until PTP sync.
- **Numbers that would be settings or timers**: CIN interface timeout, DHCP timeout, EAP timers, GCP timeouts, the R-OSSI event numbers, the OUDP pilot pattern and IUC from the 2021 paper, and its test-region frequency. The app gives no detector setting, test frequency, pilot code or timer; the screen says the settings come from the operator.
- **The SCTE paper's "over 2000 times" estimate**: it is the paper's own estimate and would need its own registry row.
- **A Vecima checklist**, **optical receive levels** and **timing-lock indicators at the node**: no public figure, LED table or status page exists for Vecima; other makers' LED tables are for their hardware.
- **"Guard band"**: neither PHY specification uses it for the gap between the directions; they say transition band. The 102 MHz mid-split edge some vendor material uses appears in no CableLabs or SCTE document read; the specification says 108.
- A conversion procedure for a node to high split (diplex and module changes) was not researched.

## Open points

- A newer PHYv4.0 issue than I08 or PHYv3.1 than I20 was not looked for beyond the CableLabs library pages that loaded (the specification landing pages are script-rendered).
- DOCSIS 3.1 section 5.2.1.1 leaves 117 MHz out of its own list while Table 4 and section 7.2.3 keep it; both are recorded in the registry row.
- Whether CableLabs changed the OUDP recommendations after 2021–2022 was not checked.
- Someone with the Vecima portal could supply the guide title and revision for the EN9000 / RFAM / RPD; until then the screen says it cannot describe a Vecima procedure.

## Checks

`research/build3/highsplit-reference.py` types the Table 29 rows as printed, parses them, and computes the gaps, widths and which side of each split 108–137 MHz falls on with Python `decimal`; `qa/build3-highsplit.test.cjs` compares the app with the JSON it writes (41 comparisons), checks every statement's citation, the registry rows, the rendered tables and that nothing is stored. Ten deliberate breakages of the content (a changed edge, the 102 MHz edge, a flipped side, a dropped locator, an unknown source, an invented pilot pattern, a weakened Vecima caution, a reordered step, a changed rule number, a wrong gap formula) were each caught.

## Corrections after Lane A's review of PR #16 (Nov 11, 2026)

- **Bring-up is not one serial sequence.** The screen listed the eight steps "in order" and put timing after configuration and tunnels. Lane A read CM-SP-R-PHY I22 section 6.9 (PTP synchronization happens in parallel with configuration by the principal and auxiliary cores) and section 6.10.1 (it has to be started before the core moves the RPD to operational). The overview, the timing step, the practice step and the guide now say the steps are listed in the order each is first needed and that timing runs in parallel; the focused test no longer asserts a literal order. I did **not** read those two sections myself: the copy of I22 I saved in an earlier session would not open, so this correction rests on Lane A's reading and the text says so.
- **Contiguous spectrum.** CM-SP-PHYv4.0 I08 (September 28, 2026) section 7.3.2: Table 29's caption reads "Assuming a Contiguous Occupied Downstream Spectrum", and the text says the occupied downstream spectrum is not required to be contiguous (its example leaves a 150 MHz hole at LTE frequencies, with the lower edge at 108 MHz and the upper edge still at 1794 MHz) and that the downstream lower edge of the new splits can sit anywhere from the upstream upper edge to the static edge in the table. I read this in the I08 text itself (the file is `CM-SP-PHYv4.0-I08-260928`, cover status ISSUED). Lane A could reopen only I07 (section 7.3.2, Table 29 on its page 108), which carries the same qualification; the I08 citation stays, and the condition is now shown on the screen, in the registry row and in the guide.
