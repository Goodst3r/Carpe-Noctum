# B2: composite margin and bandwidth restatement

November 12, 2026. This note applies to the existing upstream DOCSIS health card and OFDM power calculator. It updates the upstream interpretation in the historical November 11 DOCSIS source note; it adds no per-channel/DRW calculator or downstream ruling. All wording below is our own.

## Issue-specific sources

- [CableLabs CM-SP-PHYv3.1-I20-230419](https://account.cablelabs.com/server/alfresco/4eb470eb-aca3-4e64-af88-773b8c594fbd), issued April 19, 2023: sections 7.4.12 through 7.4.12.3.1, printed pages 71–76; capability items following Table 5 on page 42 and Table 16 on page 86. The written check at handoff_docs/reviews/chatgpt-roadmap-critique.md records the primary-document reading. Sections 7.5.9 and 7.5.9.1 supply the existing downstream normalization context.
- [CableLabs CM-SP-PHYv3.0-C01-171207](https://account.cablelabs.com/server/alfresco/52c04a05-d1c2-4384-a642-a7891aaabf7f), closed December 7, 2017: sections 6.2.19 and 6.2.24. These are the separate compatibility/per-channel requirements cited by I20; B2 does not implement them.
- The existing converter also cites SCTE 258 2026 for the downstream OFDM convention and SCTE 270 2021r1 section 30.14 for total composite power with a nonflat spectrum. B2 does not newly verify those publications or claim that I20 is the latest CableLabs issue.

## Meaning of the two existing calculations

**Spec context:** the applicable declared upstream mode requires a DOCSIS 3.1 CM and CMTS with Multiple Transmit Channel (MTC) mode enabled. Pmax is total capability. The 65 dBmV minimum/default does not establish any particular modem's actual capability. The protocol's handling of missing/zero capability is separate from an empty app field. A blank field can therefore supply only an explicitly assumed reference in that declared mode. A user-entered Pmax still needs independently established applicable total-power provenance; the app cannot verify the modem.

**Expert subtraction:** signed composite margin = comparable total Pmax reference − genuine simultaneous total. Both values must have a comparable mode, power convention and CM F-connector plane. The original unrounded subtraction determines whether the reading is below, exactly at or over the reference; the displayed signed result has six significant figures. Another declared mode supports only a generic entered-reference comparison and does not certify DOCSIS 3.0/compatibility per-channel compliance. Available per-channel increase/DRW headroom, channel count, channel width and future full-grant capability remain Unknown.

**Expert flat-PSD restatement:** L(B) = L(A) + 10·log10(B/A). The caller must confirm flat PSD across the requested bandwidths, both widths in MHz and restatement only. The ratio 6.4/1.6 gives 6.02060 dB. This does not reconstruct instantaneous OFDMA total from unknown grants, pilot allocation or pre-equalization and does not establish usable transmit headroom. The downstream whole-6-MHz convention remains scoped to downstream; it does not prohibit a general 6.4 MHz restatement.

**Unknown software bounds:** the existing converter keeps measured and every returned level within ±200 dBmV and each finite width within 0 < B ≤ 2,000 MHz. It retains support for valid decimal text longer than 50 characters; B2 adds no converter text-length cap. The existing upstream entry keeps the simultaneous total within −100 through +150 dBmV and an entered Pmax within 0 < Pmax ≤ 150 dBmV; its existing numeric text parser accepts at most 50 UTF-16 code units. The new registry rows expose these unchanged software bounds; they introduce no RF policy, equipment rating or company target. The applicable 65 dBmV Spec minimum remains separately registered.

The source tags are calc.ofdm.bandwidth (Expert), docsis.us.pmax.capability (Spec), docsis.us.compositeMargin (Expert), calc.ofdm.softwareBounds (Unknown) and docsis.us.softwareBounds (Unknown). Existing rows retain their order; the three new rows are grouped together.

## API boundary and evidence limits

The genuine callers must explicitly supply the physical/conversion confirmations. DocsisHealth.upstream accepts the existing composite-margin request or an omitted request; an explicit available_per_channel_headroom request is unsupported and returns no numeric margin. FieldCalc.ofdmPower requires flatPSD true, bandwidthUnits MHz and restatementOnly true. Missing declarations are not silently confirmed.

Independent synthetic references H1–H5 and all HX/HR cases are preserved in handoff_docs/reviews/chatgpt-calculator-test-vectors.json. This note is source/contract documentation, not a test receipt. It claims no new primary-document freshness review, modem/CMTS/meter reading, browser result, physical-device test or field acceptance. B2 leaves both published downstream total-input limits and their existing card wording unchanged; Spencer dropped the separate 33-versus-40 question.
