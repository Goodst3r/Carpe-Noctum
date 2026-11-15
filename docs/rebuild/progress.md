# Fresh rebuild ledger

Baseline: PR60 22e43d196d132a4a3d89b34da7bbbdb9a9220370. Remote fetched before branch creation.
Approved plan: conversation handoff, 2026-11-15. Fresh app structure and storage, all supplied GainMaker, node-measured unity, no Grok. Compatibility work explicitly excluded.

Ruling: use an isolated external worktree and one branch; user approved this execution through the plan.
Ruling: historical startup/integration tests requiring retired UI are superseded by new executable behavior checks; numeric/source fixtures remain reference evidence, not fresh passing tests.

Tasks: catalog/RF; graph/ONX/storage; PDF importer/exporter; interface; build/offline/Android; integrated verification; cleanup/review handoff.
