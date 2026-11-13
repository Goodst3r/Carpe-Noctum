"use strict";
const baseAssert = require("node:assert/strict");
let checks = 0;
const assert = new Proxy(baseAssert, {
  get(target, key) {
    const value = target[key];
    return typeof value === "function"
      ? (...args) => {
          const result = value.apply(target, args);
          checks++;
          return result;
        }
      : value;
  },
});
const fs = require("node:fs");
const vm = require("node:vm");
const context = { console };
vm.createContext(context);
const file = "night-sweep/map-import.js";
if (fs.existsSync(file))
  vm.runInContext(fs.readFileSync(file, "utf8"), context);
assert.ok(context.NightSweepMapImport, "Local map importer API must exist");
const M = context.NightSweepMapImport;
// Real-browser fixtures cover file decoding; these geometry vectors isolate branch and review rules.
const doc = {
  source: { id: "synthetic" },
  candidates: [
    {
      id: "n",
      name: "Launch Exact / 01",
      tag: "N1",
      kind: "active",
      x: 0,
      y: 0,
      page: 1,
    },
    {
      id: "s",
      name: "Passive Exact",
      tag: "S1",
      kind: "passive",
      x: 100,
      y: 0,
      page: 1,
      ports: ["1", "2"],
    },
    {
      id: "a",
      name: "Amp exact-A",
      tag: "A1",
      kind: "active",
      x: 200,
      y: 0,
      page: 1,
      installedModel: "HGD",
      device: "active_gm_hgd",
    },
    {
      id: "b",
      name: "Amp exact-B",
      tag: "A2",
      kind: "active",
      x: 100,
      y: 100,
      page: 1,
    },
    {
      id: "abs",
      name: "Not Installed",
      tag: "B1",
      kind: "active",
      x: 150,
      y: 0,
      page: 1,
      status: "absent",
    },
  ],
  pages: [
    {
      number: 1,
      segments: [
        { x1: 0, y1: 0, x2: 100, y2: 0 },
        { x1: 100, y1: 0, x2: 200, y2: 0 },
        { x1: 100, y1: 0, x2: 100, y2: 100 },
      ],
      cableLabels: [
        {
          x: 50,
          y: 0,
          length: 120,
          size: ".625",
          construction: "P3",
          text: "120 ft P3 .625",
        },
        {
          x: 150,
          y: 0,
          length: 80,
          size: ".500",
          construction: "P3",
          text: "80 ft P3 .500",
        },
        {
          x: 100,
          y: 50,
          length: 60,
          size: ".625",
          construction: "",
          text: "60 ft .625",
        },
      ],
    },
  ],
};
const draft = M.buildDraft(doc, {
  launchId: "n",
  port: "Main",
  destinationIds: ["a", "b"],
});
assert.ok(
  draft.rows.every((r) => /^r\d+$/.test(r.id)),
  "Imported rows must survive existing save/reopen ID validation",
);
assert.equal(draft.rows.length, 3);
assert.equal(draft.launch.name, "Launch Exact / 01");
const s = draft.rows.find((r) => r.name === "Passive Exact"),
  a = draft.rows.find((r) => r.name === "Amp exact-A"),
  b = draft.rows.find((r) => r.name === "Amp exact-B");
assert.equal(s.parent, "source");
assert.equal(a.parent, s.id + "::through");
assert.equal(b.parent, s.id + "::through");
assert.equal(a.length, 80);
assert.equal(a.cable, "p3_500");
assert.equal(b.cable, "");
assert.equal(a.mapImport.tag, "A1");
assert.equal(a.mapImport.installedModel, "HGD");
for (const r of draft.rows) {
  assert.equal(r.mapImport.connectionConfirmed, false);
  assert.equal(r.mapImport.status, "draft");
}
assert.ok(b.mapImport.reasons.some((x) => /construction/i.test(x)));
assert.ok(!draft.rows.some((r) => r.name === "Not Installed"));
assert.throws(
  () =>
    M.buildDraft(doc, { launchId: "abs", port: "Main", destinationIds: ["a"] }),
  /absent/i,
);
assert.throws(
  () => M.buildDraft(doc, { launchId: "n", port: "", destinationIds: ["a"] }),
  /port/i,
);
const continuous = JSON.parse(JSON.stringify(doc));
continuous.pages[0].segments = [
  { x1: 0, y1: 0, x2: 200, y2: 0 },
  { x1: 100, y1: 0, x2: 100, y2: 100 },
];
const continuousDraft = M.buildDraft(continuous, {
  launchId: "n",
  port: "Main",
  destinationIds: ["a", "b"],
});
assert.equal(
  continuousDraft.rows.find((r) => r.name === "Amp exact-A").length,
  80,
  "Length labels on one continuous line belong only to their own spans",
);
assert.equal(
  continuousDraft.rows.find((r) => r.name === "Passive Exact").length,
  120,
);
assert.throws(
  () => M.buildDraft(doc, { launchId: "s", port: "1", destinationIds: ["a"] }),
  /node or active/i,
);
const complex = JSON.parse(JSON.stringify(doc));
complex.pages[0].segments = Array.from({ length: 4001 }, (_, i) => ({
  x1: 0,
  y1: i,
  x2: 100,
  y2: i,
}));
assert.throws(
  () =>
    M.buildDraft(complex, {
      launchId: "n",
      port: "Main",
      destinationIds: ["a"],
    }),
  /4000.*segments.*Split/i,
  "Oversized geometry must be rejected rather than truncated",
);
console.log(
  `map-import: ${checks} checks passed (branch, review, save IDs, continuous spans, launch)`,
);
