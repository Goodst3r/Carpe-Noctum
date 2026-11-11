# Outage first-response card: where the wording came from (build list item 8)

Read November 11, 2026. Covers `night-sweep/outage.js`, built on the shared engine `night-sweep/checklist.js`.

## What the card is, and is not

Prompts for the first steps of an outage call: confirm the scope, check power, check the node and its optics,
work through the actives in order, tell the right people, write down the times, with optional damage or theft
notes. It opens with "Follow your company's outage procedure first" and says it is **not** any company's
procedure. The wording is original, written for this app from general field practice. **No NCTI or SCTE text,
question or figure is copied.**

It holds no number: no level, voltage, limit or time budget. Those belong to a company's own outage procedure,
so the card says "the value your company expects". Because it has no limit, target, constant or formula it adds
**no row to the threshold registry**. The only things typed in are notes: a plant place (node leg, amp or pole),
four times, what was found and done, who was told **as a role**, and three optional damage or theft notes.

## No customer identifiers

There is no field for a customer name, address, phone number or account number, and the card says so at the top
and in the field labels. It holds no photos and no locations, so nothing can be tied to a home. The build list
item names this limit ("Never stores customer identifiers"); `qa/build3-checklist.test.cjs` fails if a field
label asks for an identity.

## What was consulted

| Source | What was read | Used for |
| --- | --- | --- |
| `docs/BUILD_LIST.md` item 8 (this repository) | The item text: confirm scope, check power, node optics, actives in order, notify the ROC, record times; optional damage or theft fields (what was found, times, who was told); never store customer identifiers | The section list and the notes |
| SCTE blog, "Closing the Evidence Gap: How STRIKE and CIPS Are Standardizing the Broadband Industry's Attack Response", <https://www.scte.org/blog/how-strike-and-cips-are-standardizing-the-broadband-industrys-attack-response/> (Sept 30, 2026) and SCTE Standards Updates, <https://www.scte.org/standards/standards-updates/> | That SCTE created a Critical Infrastructure Protection Subcommittee (CIPS) whose first work is a forensic-readiness and evidence-collection standard for intentional damage, and that the standard is still being developed. The blog names a five-stage response lifecycle; **this card does not implement it** and does not use the stage names | The statement on the card that the standard is not implemented; the damage and theft section only tells the technician to make the area safe, leave the scene as it is until the company's procedure says otherwise, and write down what, where and when |
| General field practice | Common reminders an experienced technician expects: check power before optics, work outward from the node, note the last working and first failing active | The rest |

Not read: any operator's outage procedure; any SCTE or NCTI course text; the CIPS standard (not published).

## Provenance label

Content: **expert**, general practice, **unverified**, not reviewed. The card states in its own footer that
"A supervisor has not yet reviewed it against your local outage procedure, and that review is needed before
coworkers use it."

## Open questions for a supervisor

This is the release condition from `handoff_docs/PARALLEL_TASKS.md` (item B8) and `docs/BUILD_LIST.md` item 8.

1. Does the local outage procedure order the checks the same way (scope, power, node optics, actives outward)?
   Which steps are missing, and which should not appear?
2. Who must be told, and in what order (ROC, supervisor, dispatch)? The card says "ROC or dispatch" and "your
   supervisor" without names.
3. For suspected damage, theft or vandalism, what does the company want recorded and by whom? The card only
   asks for what, where and when in the technician's own words. May a technician's phone hold even that?
4. Is a text note ("Save as text") acceptable to send to the ROC, or must the report go through a company system?
5. Should some prompts be impossible to hide? (The technician can hide, reword and add any item.)

## What this note does not claim

- No legal or regulatory requirement (including reporting duties for vandalism or outages) is stated or implied.
- Nothing was checked against a current standard or a company procedure.
