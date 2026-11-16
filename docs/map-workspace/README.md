# Map workspace on build 6

Open Route & Sweep, upload a PDF, then select the design split. Choosing a split first still supports a manual route. A PDF opens in the full-page editor. Move pans the artwork; Edit enables station placement and connections. Pinch or wheel around the point of interest, use the large +/- buttons, Fit map, Fit route, or Selected point. The toolbar scrolls horizontally on narrow screens. Select a marker for the compact station sheet; Edit station opens the detailed route workspace. Save stores the job and original PDF on this device. Undo/redo covers the last 30 changes in the current job/map; replacing a map resets that history.

Trace to here highlights a selected source-to-destination path. Every imported connection remains provisional until physical direction, port, cable and length are confirmed. Reading a schedule never makes design levels into measurements. The existing build 6 physical-port RF math, ONX compensation, original attachment storage and PDF export are retained.

The illustrated key follows this project's confirmed conventions: numbered circles/squares/octagons are 2/4/8-port taps; large triangles containing black triangles are amplifiers; small empty triangles are line extenders; solid black circles are two-way splitters; half-black circles are directional couplers. Black is the tap leg, white the through leg, including rotated symbols. Printed tap/coupler numbers are loss in dB, not exact part identities.

## Optional online recognition

The offline editor and existing local OCR do not require an account. Configure the separate service described in [map-service](../../map-service/README.md) to enable the online option. Provider keys stay on that service; the app gets a revocable device token.

Only the selected page's newly flattened PNG is eligible for sending. All locally extracted text starts covered with opaque masks. Keep node and equipment names covered; uncover only technical values you deliberately want read. Inspect for text rendered as artwork too. Draw additional covers as necessary. Download the exact preview if useful. Review acknowledgment and a second send confirmation are required. There is no automatic scan on import and no original PDF upload.

OpenAI and Gemini independently read the same reviewed image. Each then checks the other provider's generic findings against the image. The comparison marks agreement, disagreement and unresolved suggestions, including connection-role mismatches. Accept symbols individually, then choose exact equipment. The app never applies AI-proposed connections automatically and never uses a model for RF arithmetic. Map/page/job changes discard pending results. Tokens are held only in the open panel and cleared when it closes.

No service was deployed and no live provider calls were made during implementation. Provider account retention policies still apply to reviewed images. Test native transport and a signed APK separately before release.

## RF source boundaries

Cable loss at a known frequency is published attenuation in dB/100 ft multiplied by feet/100. Passive output is input minus that physical port's published path loss. SCTE 293-4 (2024), sections 5.1.2 and 5.3.1, supports length scaling and distinguishes ideal division from actual insertion loss: https://account.scte.org/documents/8045/SCTE_293-4_2024.pdf

Original Scientific Atlanta Surge-Gap, Multimedia and later Cisco 1.25 GHz families remain separate exact models. Three inherited Surge-Gap 750 MHz reference points are explicitly limited to that frequency; manufacturer-table revalidation is pending. No broad curve was invented from them, and unsupported frequencies remain unavailable. Source attribution: Scientific-Atlanta Broadband Data Book Rev 13 (December 2001), pp.6-1/6-2: https://manuals.plus/m/264e77f66cf8fb6b48ff531ca9c08c07b1568d2ca121f265dbf3d25350f130f3.pdf . Retrieval of the table section was not completed during this implementation.

The public NCTI Construction Technician objectives include plant-map reading: https://ncti.com/course/?courseid=13174 . SCTE HFC System Design describes strand maps and cable math: https://account.scte.org/education/course-offerings/course-catalog/hfc-system-design . Public descriptions were accessed; enrolled course lessons were not accessed, and this app is not represented as NCTI/SCTE certified.

## Node legs and active identifiers

The supplied composite node symbol uses A/B on its upper left/right legs and C/D on its lower left/right legs. The node editor shows this diagram and lets you assign those letters explicitly to physical ports. A/B/C/D never silently replace the manufacturer's port numbering or change existing source sweeps. If an imported A# candidate is actually the source node, choose **Use symbol as source node**; outgoing connections become provisional for physical-port review.

When a confirmed active receives its adjacent tombstone, the matching highlighted A# FreeText annotation is removed from the working preview and exported copy. Its identifier stays in the tombstone. Other annotations and unconfirmed labels are retained. The uploaded original stays byte-for-byte intact. This exposes internal director markings underneath editable annotations. A flattened label cannot reveal artwork that is no longer present.

Online scan suggestions can include the visible internal splitter/coupler, its printed value and tap orientation. These remain evidence for manual confirmation of the installed director and physical legs; they do not change RF settings automatically. The review panel shows each provider's stage status and proposed connection endpoints/roles. Accepted symbol evidence retains generic provider IDs locally so those proposals can be associated with the reviewed candidates.

## Coax-map usability corrections

Import now opens a review panel with grouped issues and a proposed source symbol. Confirm the source choice or choose map-only import. A/E map annotations are read locally; schedule-matched E labels gain provisional positions. Unmatched identifiers and unresolved equipment shapes stay visible for review. Label/annotation bounds remain separate from the equipment contour and its cable contacts. Compound-node detection supports rotated artwork. Candidate cable connections follow contact and endpoint evidence; crossing lines alone never form a junction. These proposals still need physical direction, port, cable and length confirmation.

Markers use fixed 16px symbols with 44px controls. Crowded positions open a chooser, which closes on selection, outside click, Escape or Close. Find station searches names/tags inside the full-page editor. Selected point focuses the equipment, and the selected-station summary remains readable on phones. Fine CAD details can zoom to 128× relative to the page surface; the visible PDF region is redrawn at device resolution after gestures settle, with a bounded 4-megapixel canvas. The separate full-page raster and privacy masks retain original normalized coordinates for optional scanning.

Printed compact tombstones now use at least 8 pt text, independent of the original map-label font. They contain identifier, equipment, input/output endpoint levels and status. Clicking a tombstone in the exported PDF opens appended station details (pad/EQ/director, measurement summaries, targets and checks); each report links back to its map card. All original map pages remain. Export and import share a 200-page limit including reports and a 20 MiB source-byte limit; an oversized report export fails clearly before producing a PDF the app cannot open. Saved normalized card positions are retained and clamped to the page; cards expand instead of silently shrinking text.

GS7K main-output choices are 1, 2, 4, 5. Optional housing outputs 3/6 require installed-hardware confirmation. Older readings and assignments on physical port 3 are retained and marked unverified; they are never renamed to 5. Those readings do not drive RF calculations until their output configuration is confirmed. A/B/C/D map aliases remain independent.
