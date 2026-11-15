# Fresh rebuild ledger

Baseline: PR60 22e43d196d132a4a3d89b34da7bbbdb9a9220370. Remote fetched before branch creation.
Approved plan: conversation handoff, 2026-11-15. Fresh app structure and storage, all supplied GainMaker, node-measured unity, no Grok. Compatibility work explicitly excluded.

Ruling: use an isolated external worktree and one branch; user approved this execution through the plan.
Ruling: historical startup/integration tests requiring retired UI are superseded by new executable behavior checks; numeric/source fixtures remain reference evidence, not fresh passing tests.

Tasks: catalog/RF; graph/ONX/storage; PDF importer/exporter; interface; build/offline/Android; integrated verification; cleanup/review handoff.

## Delivery

Fresh implementation pushed to draft PR61. Final PWA0435280d7ff18732da03 published as Site version12 at https://nightsweep-field.goodst3r.chatgpt.site. Source commit9348dbea5657df69d5154958a9fe4008782240b1 maps to Site sourcecb0166b76be93bc7a090bef3ddda88279666ed01. See WEB_RELEASE.json for deployment IDs. Source-helper installation was unavailable, so ordinary Git fallback used a stdin-only short-lived credential and temporary process-local authorization headers; no credential persisted.

All70 selected obsolete remote heads were archived with verified annotated recovery tags,13 superseded PRs48–60 closed, and70 branches deleted using exact-head leases. Five remote heads remain: main/build3, two independent branches, and the new implementation branch. Exact receipts are in REMOTE_CLEANUP_RESULT.json. Current source cleanup removes836 obsolete tracked files and retains licensed PDF/OCR assets. Claude review, original-key signing and phone/RF acceptance are pending; no merge was performed.

## Claude review fixes — build6

Claude's external review blocked4b660c4 on full-sweep PDF performance and requested replacement/editor/native checks. H1 and M1/M2/M3 source changes plus lower-severity dispositions are in REVIEW_RESPONSE.md. The initial generated bundle missed the final closeEdge focus update; CI parity caught it. Regenerated and re-tested the exact source; implementation9023b270b070a93321496248c60a77d63a3ca32f, PWA0164f02cd485582813da, Site sourcee95d50d4d046981d35a901c57376867dd2dcd87d. Published existing Site version14, original audience retained.

Revised checks:152total/149pass/3opt-in skips;36browser;13AI/offline;14PDF(private inputs supplied locally); native3compiled policy/callback checks and full SDK compile. Actual98-point private ONX/map controlled export completed in milliseconds and preserved source/label count. Private six-file review ZIP remains ignored/local. External changed-code re-review and signed device pass remain pending; no merge/signing/phone acceptance is claimed.
