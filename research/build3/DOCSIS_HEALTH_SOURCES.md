# DOCSIS health card: sources and how they were checked

November 11, 2026 · Lane B (Claude) · build list item 5 · app code in `night-sweep/docsis-health.js`

What the card compares and where each figure comes from. Wording here is our own; the CableLabs specifications are cited by document, issue, section and table. A "capability limit" is a level the cable modem must be able to accept or transmit. None of these figures is an operating target, and the specifications say that the level range implies nothing about error performance.

## What was read, and where

| Figure used by the card | Value | Document, section, table | Read in this session |
| --- | --- | --- | --- |
| Downstream SC-QAM channel level | −15 to +15 dBmV per 6 MHz channel (64-QAM and 256-QAM, North American) | CM-SP-PHYv3.0-C01-171207 (December 7, 2017), section 6.3.2, Table 6–22, row "Level Range (one DOCSIS channel)" | Yes. The text of the whole table in a third-party copy of the CableLabs PDF (axp-systems-engineering.de, `CM-SP-PHYv3-0-C01-171207.pdf`) and in ETSI EN 302 878-2 V1.1.1 table 6-22, which carries the same values |
| SC-QAM range applies to DOCSIS 3.1 modems | by reference | CM-SP-PHYv3.1-I20-230419, section 6.4.2 (p. 43) | **Not re-read here.** Taken from `SOURCE_VERIFICATION.md` (earlier build 3 reading with Firecrawl) |
| Downstream OFDM level | −9 to +21 dBmV per 24 MHz, "equivalent PSD to SC-QAM of −15 to +15 dBmV per 6 MHz" | CM-SP-PHYv3.1-I20-230419 (April 19, 2023), section 7.5.11, Table 45 "Electrical Input to CM", row "Level Range (24 MHz min occupied BW)" (p. 146 in the table of tables) | Yes. CableLabs-hosted copy whose title page reads I20 (`account.cablelabs.com/server/alfresco/4eb470eb-…`) and a third-party copy of the same PDF |
| Total downstream input power, DOCSIS 3.1 | below 40 dBmV, 54 to 1794 MHz, assuming negligible power outside | PHYv3.1 I20 Table 45, row "Total Input Power" | Yes, same copies |
| Total downstream input power, DOCSIS 3.0 only | below 33 dBmV, 40 MHz and above | PHYv3.0 C01 Table 6–22, row "Total Input Power (40 MHz and above)" | Yes |
| Pmax, maximum total transmit power | CM must be able to transmit a total average power of 65 dBmV; may transmit more; 65 is the default and lowest allowed Pmax; the CM tells the CMTS its Pmax in a capability message | PHYv3.1 I20 section 7.4.12.2 "Transmit Power Requirements", section 7.4.12.3.1 (terminology, Pmax), the transmitter output tables in sections 6.2 and 7.4.13 (row "Level") | Yes, same copies. The same statement is in issue I08 (the version the build list cited) and in ETSI TS 103 311-2 section 7.4.13.2 |

Page numbers for Table 6–22 (p. 100) and section 6.4.2 (p. 43) come from the earlier reading; the table-of-tables entry for Table 45 (p. 146) is from the I20 contents list.

## Things the sources say that the card handles deliberately

- **6 MHz and 24 MHz differ by 0.02 dB.** The OFDM row prints both −15 to +15 dBmV per 6 MHz and −9 to +21 dBmV per 24 MHz. 10·log10(4) is 6.0206 dB, so the strict conversion of −15 per 6 MHz is −8.98 per 24 MHz. The card uses each printed figure for its own bandwidth. The reference script records the difference as `ofdm_per24_vs_per6_difference_dB` (0.0206 dB).
- **Other OFDM bandwidths are derived, not printed.** The card moves the 24 MHz row by 10·log10(B ÷ 24) for B a whole number of 6 MHz channels from 24 to 192 MHz and labels that Expert (registry row `docsis.ds.ofdm.scaling`). This relies on equal power density across the band, the same assumption as the OFDM power calculator and SCTE 258 2026.
- **DOCSIS 3.0 and 3.1 total-power limits differ** (33 versus 40 dBmV). Applying 40 to a 3.0-only modem would pass a signal the modem is not required to handle, so the card asks which one it is.
- **EuroDOCSIS differs.** Annex A (8 MHz channels) in the same C01 document lists −17 to +13 dBmV for 64-QAM and −13 to +17 dBmV for 256-QAM. Those are not used; the card is North American only.
- **Pmax is a minimum capability.** It is the least a modem must be able to transmit in total, not a limit on what it sends, and a modem can declare a higher value. The card shows headroom (Pmax − total) and does not call it pass or fail. Per-channel numbers on a modem page are referenced to 1.6 MHz; a 6.4 MHz channel's actual power is 6 dB above its reported number (I20 section 7.4.12.2), so the card asks for a total.

## What the card leaves out

MER and SNR requirements; per-channel upstream power and the P1.6 equivalent-channel arithmetic; the rule that no demodulated channel may exceed the lowest demodulated channel by more than 10 dB (Table 6–22 "Maximum average power of carrier input to CM"); DOCSIS 4.0 and FDX tables; EuroDOCSIS; total input power for modems with an unusual band. Each could be a later addition with its own registry row.

## Not verified

- The section 6.4.2 pointer and the page numbers noted above (earlier reading, not repeated).
- Whether a newer issue than I20 exists. The earlier reading (`SOURCE_VERIFICATION.md`) found no I21 and I20 does not mention one; that was not repeated here.
- No modem, CMTS or meter was read; every example reading in the tests and the practice step is synthetic.

## Tools used

Exa web search and fetch for the CableLabs-hosted and mirrored specification text. Firecrawl was out of credits (daily allowance resets about 23:09 UTC on November 11), so nothing here depends on it. The independent arithmetic is `docsis-health-reference.py` (Python `decimal`, 50 digits); Wolfram was not available in this session.
