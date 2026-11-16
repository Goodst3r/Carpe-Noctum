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
