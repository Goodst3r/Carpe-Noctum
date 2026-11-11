# Node documentation refresh — 1.7 Alpha

Checked November 10, 2026. This is a source audit and workflow proposal. No application files or Android package were changed.

The newest public EN9000 family brief located is **September 2026**. The three existing node profiles retain their verified RF bands and test-point references; the wider housing/RFAM capability does not establish the installed RPD bandwidth. All **120 GS7000 current/watt table cells** match the original configuration tables. No power-curve correction is proposed.

| Equipment | Newest matching documentation located | Practical workflow consequence |
| --- | --- | --- |
| Standard GS7000 1 GHz | OL-29643-02; current Cisco index lists October 12, 2017 | Optical receiver/FCM routing, OIB receiver pad, per-port output pads and path EQs. Forward pp107–110; reverse pp111–112. |
| Standard GS7000 1.2 GHz | First published October 2015; support listing November 19, 2015 | Forward pp93–95; reverse pp96–97. Use 1.2 GHz receiver table and EQ chart. |
| GS7000 SHO / Fiber Deep | August 2016 manual; July 17, 2017 datasheet | Common and left/right EQs differ from standard segmentable launch. Manual factory-tilt descriptions conflict: 21 versus 22 dB. |
| GS7000 Intelligent | March 2018 hardware/software chapters; Manager 24.1 June 12, 2024 | Save enabled Port 1 targets before forward Auto Setup; allow AGC to settle and inspect per-port internal spectra. No physical RF amplifier test points. |
| EN9000 / EN9000U | September 2026 family brief | Newer brief adds ERM412/422 support. It remains a product brief, not an RFAM/RPD commissioning manual. |

## Level setting and AGC

The proposed setup records now describe where a technician actually adjusts output: OIB receiver padding establishes the highest required level within a segment, individual forward output pads lower shared ports, and the matching path EQ controls tilt. Design levels remain job inputs. Optical input, receiver variant, segmentation, installed pads and EQs must be recorded before applying the manual’s examples.

The conventional GS7000 **LCM Auto Set-Up discovers installed modules**. It is not automatic RF level/tilt balancing. The **Intelligent node’s LCS Auto Setup adjusts forward OIB drive**, after low/high MHz and corresponding dBmV have been saved and at least Port 1 enabled. The guide distinguishes command completion from settled AGC: inspect status/alarms and each port’s spectrum several minutes afterward. It does not align the return path. The Manager 24.1 route is an alternative for a compatible installed system, not an additional required step or an instruction to upgrade.

## EN9000 qualifications

The September 2026 brief keeps the existing RFAM split options. Its RF-performance block is explicitly conditioned on **ERM3 installed**. The separate ERM322/324 brief states 1.2 GHz downstream / 204 MHz upstream support; a wider RFAM does not make ERM3 a 1.8 GHz RPD. ERM412/422 is a different module family. Its September-file PDF prints March 2026 internally, so the discrepancy is retained.

The newer node brief lists 180 W total PSU output and 200 W thermal dissipation. These are different quantities and neither is typical whole-node AC consumption. Preserve manual/measured-load entry. The older May 2024 brief remains the source for −20 ±1 dB test-port response; the newer brief does not repeat that coupling value.

Vecima’s official support page sends installation/configuration guides, manuals and release notes to its customer portal. No public EN9000/RFAM/RPD commissioning procedure was located. No CLI commands, AGC sequence or portal manual contents were invented.

## Sources and outputs

- [Current Cisco installation guide index](https://www.cisco.com/c/en/us/support/video/gs7000-node/products-installation-guides-list.html)
- [September 2026 EN9000 brief](https://vecima.com/wp-content/uploads/2026/09/Vecima-Product-Brief-EN9000-Sep2026.pdf)
- [September 2026 ERM322/324 brief](https://vecima.com/wp-content/uploads/2026/09/Vecima-Product-Brief-ERM322_ERM324-Sep2026.pdf)
- [ERM412/422 brief with revision-date discrepancy](https://vecima.com/wp-content/uploads/2026/09/Vecima-Product-Brief-ERM422_ERM412-Sep2026.pdf)
- [Vecima documentation access](https://vecima.com/company/product-support/)
- [Intelligent-node LCS setup](https://www.cisco.com/c/en/us/td/docs/video/access_edge/Nodes/GS7000/b_gs7000_sho_inode_software_install_config_guide/b_gs7000_sho_inode_software_install_config_guide_chapter_0100.html)
- [Intelligent-node Manager 24.1](https://www.cisco.com/c/en/us/td/docs/video/access_edge/Nodes/GS7000/b-inode-manager-application-user-guide-24-1/m-inode-manager-usage.html)

`node-manuals.json` contains record-level findings, limits and catalog metadata proposals. `setup-manuals-node-patch.json` is keyed by record ID for the owning editor to merge without replacing unrelated work. `node-power-table-check.json` retains exact configuration comparisons and source acquisition metadata.

## Retrieval limits

Octen search ran but its first result was unrelated; Octen PDF extraction failed with **403, payment method required** (request `20261110233810450E0STNHX0KC`). No service was upgraded or purchased. Parallel search and full-document retrieval succeeded, including both large original Cisco manuals. Parallel acquisition metadata for some stable historical documents is August/September 2026; the current Cisco index was separately retrieved today. Native web/direct executor access to the newest EN9000 PDF failed, so its full content came from Parallel. “Newest located” does not claim access to unpublished or customer-only revisions.
