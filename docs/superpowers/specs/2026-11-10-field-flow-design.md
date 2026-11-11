# NightSweep 1.7 Alpha field workflow

Build on 1.6 Alpha commit a3d25f0, preserving offline calculations, jobs and evidence. User authorized reversible implementation decisions and specified 1.7 Alpha.

Add a source selector directly in Route > Setup: node, amplifier/LE, or manual output. A node is the launch reference, never an RF gain block. Reuse the existing node record; keep measured launch and manufacturer ratings separate. Do not apply published output targets or test-point corrections automatically.

Keep the five primary tabs. Add Equipment setup under Route, with exact source/route-active selection, matching manufacturer manuals, local review checklists and ACI DSIM guidance. Add contextual next-step controls between launch, route, setup, measurements and evidence. Distinguish actual manuals, datasheets and request-only material. Preserve checklists per exact model/band; they do not establish RF acceptance. No guessed supervisor credentials; record key readiness only.

Audit each application module and catalog structure, map every installed active/node variant to source evidence or explicit gaps. Correct demonstrated engine/input defects with regression tests. Native Android and browser use the same built standalone HTML. Keep coworker files, source and signing material separate.

Approach selected by developer judgment: incremental modules and existing controls, avoiding architecture migration. A full rewrite would put saved work and established calculations at needless risk; documentation alone would not resolve the disconnected launch/setup flow.

Validation: meaningful regression examples, entire existing automated suite, rendered mobile browser checks where available, APK identity/signature/embedded-HTML verification if toolchain is available. Physical devices and unavailable manuals remain explicitly unverified. Preserve public site audience and sanitized examples.
