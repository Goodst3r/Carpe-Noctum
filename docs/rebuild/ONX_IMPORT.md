# Local measurement imports

From a station's physical-port card, choose **Import ONX** and select a `.zip`, `.json`, or `.cdm.json.gz` export. The app unpacks it on your device. Review the detected report, then confirm the destination station, physical port and before/after stage. A filename or meter model does not set plant equipment or its physical ports.

| Detected data | Saved information | Forward calculation behavior |
| --- | --- | --- |
| Forward sweepless Absolute MHz/dBmV | Raw and corrected levels, referenced curve when present, test metadata and scalar diagnostics | Replaces the confirmed port/stage after measurement-plane review |
| Reverse referenced sweep | Relative dB curve, reference and marker/configuration tables | Separate evidence; no forward target replacement or TP offset |
| OneCheck Expert | Channel/diagnostic tables and available exported charts, units, statuses and technical metadata | Separate evidence; upstream transmit values and diagnostic channels do not become a forward sweep |
| Channel plan | Configuration identified as a plan | Never treated as measured levels |

For a forward sweep, choose direct measurement or enter the verified physical test-point loss. If the meter compensation setting is nonzero, declare whether that offset is already included in the exported values. Raw values remain available and the physical correction is applied once. The before/after label records comparison stage; the latest accepted forward upload drives that port.

Imported reports remain under station details after a local save/reload. Review units and section names when changing the displayed curve: referenced dB, MER, upstream transmit and absolute downstream dBmV describe different quantities. Exported plot geometry can include OFDM boundary points; these are preserved as source evidence and identified separately from measured levels.

The app never opens the report HTML or executes its scripts. It reads supported table text and strict numeric data locally, without fetching report images, scripts or styles. Unsupported or ambiguous documents fail with an import error. Imports are bounded to20MiB input, with separate decoded document/record limits. Cancelling or changing the job before saving leaves station measurements untouched.

Original imports are stored locally by verified hash and included in the local job backup. Backups can contain private measurement information: they are files you save yourself, not a public upload. Example originals and extracted private content are excluded from the source repository and public web build.
