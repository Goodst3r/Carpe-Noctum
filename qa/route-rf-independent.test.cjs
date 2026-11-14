"use strict";
// Independent review vectors, promoted without changing their assertions.
const base = require("node:assert/strict");
let checks = 0;
const A = new Proxy(base, {
  get(o, k) {
    return typeof o[k] === "function"
      ? (...v) => {
          o[k](...v);
          checks++;
        }
      : o[k];
  },
});
const root = require("node:path").resolve(__dirname, "..");
const H = require(root + "/night-sweep/engine.js"),
  W = require(root + "/night-sweep/route-workbench.js"),
  C = require(root + "/night-sweep/catalog.json");
const setup = {
  lowF: 54,
  highF: 860,
  lowLevel: 10,
  highLevel: 10,
  liveMax: 860,
  launchMode: "sqrt",
  basis: "nominal",
  temperature: 68,
};
const amp = {
  id: "r1",
  device: "active_gm_hgd",
  parent: "source",
  length: 0,
  cable: "",
  gainLowF: 54,
  gainHighF: 860,
  gainLow: 31,
  gainHigh: 31,
  targetLow: 43,
  targetHigh: 43,
};
const make = () => ({ setup: { ...setup }, rows: [structuredClone(amp)] });
const assess = (s) => W.assess(H, s, C, s.rows[0]);
let s = make(),
  b = assess(s);
for (const band of ["low", "high"]) {
  A.equal(b.budget[band].requiredGain, 33);
  A.equal(b.budget[band].margin, -2);
  A.equal(b.budget[band].predictedOutput, 41);
}
A.equal(b.label, "Short on gain");
s.rows[0].outputLoss = 2;
b = assess(s);
for (const band of ["low", "high"]) {
  A.equal(b.budget[band].requiredGain, 35);
  A.equal(b.budget[band].margin, -4);
  A.equal(b.budget[band].predictedOutput, 39);
}
s = make();
s.rows[0].gainLow = s.rows[0].gainHigh = 35;
b = assess(s);
A.equal(b.label, "Gain available · output limit unknown");
A.equal(b.budget.outputStatus, "unknown");
A.equal(b.budget.gainStatus, "marginal");
s.rows[0].outputLimitLow = s.rows[0].outputLimitHigh = 44;
b = assess(s);
A.equal(b.budget.outputStatus, "above_limit");
A.equal(b.budget.assessmentStatus, "output_limit");
A.equal(b.budget.aboveConfiguredLimit, true);
A.equal(b.budget.aboveTargetLimit, false);
s.rows[0].outputLimitHigh = 42;
b = assess(s);
A.equal(b.budget.aboveTargetLimit, true);
s = make();
delete s.rows[0].gainLow;
delete s.rows[0].gainHigh;
b = assess(s);
A.equal(b.label, "Needs input");
A.equal(b.budget.low.availableGain, null);
A.equal(b.budget.publishedReference.screeningOnly, true);
s = make();
s.setup.liveMax = 700;
b = assess(s);
A.equal(b.label, "Needs input");
A.match(b.reason, /high.*marker.*available/i);
A.equal(b.budget.high.margin, null);
s = make();
s.rows[0].length = "";
b = assess(s);
A.equal(b.label, "Needs input");
A.equal(b.budget.low.input, null);
A.match(b.reason, /span length|slack/i);
s = make();
s.rows[0].length = 100;
s.rows[0].cable = "";
b = assess(s);
A.equal(b.label, "Needs input");
A.equal(b.budget.low.input, null);
A.match(b.reason, /cable construction|loss curve/i);
const passive = C.devices.find(
  (d) => !d.active && !d.custom && d.id !== "none" && d.ports?.length,
);
s = make();
s.rows = [
  {
    id: "r1",
    device: passive.id,
    parent: "source",
    length: 0,
    mapImport: {
      kind: "passive",
      status: "installed",
      connectionConfirmed: true,
      modelConfirmed: false,
      reviewResolved: true,
    },
  },
  { ...amp, id: "r2", parent: "r1::" + passive.ports[0].id },
  { ...amp, id: "r3" },
];
let r = H.run(s, C, 54);
A.equal(r.results[0].input.level, null);
A.equal(r.results[1].input.level, null);
A.match(r.results[1].blockedReason, /model/i);
A.equal(r.results[2].input.level, 10);
for (const status of ["draft", "absent", "proposed"]) {
  s = make();
  s.rows[0].mapImport = {
    kind: "active",
    status,
    connectionConfirmed: true,
    modelConfirmed: true,
    reviewResolved: true,
  };
  A.equal(H.run(s, C, 54).results[0].outputs[0].level, null);
  A.equal(assess(s).label, "Needs input");
}
s = make();
s.rows[0].workbench = {
  legGain: {
    aux: { low: 20, high: 24, lowF: 54, highF: 860, loss: 2 },
    third: { low: 15, high: 17, lowF: 54, highF: 860, loss: 1 },
  },
};
s.rows.push(
  { id: "r2", device: "none", parent: "r1::aux", length: 0 },
  { id: "r3", device: "none", parent: "r1::through", length: 0 },
);
r = H.run(s, C, 54);
A.equal(r.results[1].input.level, 28);
A.equal(r.results[2].input.level, 41);
A.equal(r.results[0].outputs.find((p) => p.id === "third").level, 24);
const reading = {
  input: "10",
  output: "40",
  inputPlane: "tp",
  outputPlane: "port",
  inputCorrection: "20",
  outputCorrection: "20",
};
A.equal(W.measuredGain(reading, 54, 54), 10);
A.equal(reading.input, "10");
A.equal(reading.output, "40");
A.equal(W.measuredGain({ ...reading, inputPlane: "port" }, 54, 54), 30);
A.equal(W.measuredGain({ ...reading, inputCorrection: "" }, 54, 54), null);
A.equal(W.measuredGain(reading, 54, 860), null);
A.equal(W.measuredGain({ ...reading, inputPlane: "" }, 54, 54), null);
A.equal(W.measuredGain({ ...reading, inputPlane: "port" }, -1, -1), null);
A.equal(W.measuredGain({ ...reading, inputPlane: "port" }, 1801, 1801), null);
s.rows[0].workbench.modelId = "active_gm_le_manual";
r = H.run(s, C, 54);
A.equal(r.results[0].outputs.find((p) => p.id === "aux").level, null);
A.equal(r.results[1].input.level, null);
A.equal(r.results[2].input.level, null);
console.log(`Independent route RF: ${checks} checks passed`);
