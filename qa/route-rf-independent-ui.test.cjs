"use strict";
// Independent DOM reproductions: invalidate changed spans and archive replaced models.
const fs = require("fs"),
  path = require("path"),
  A = require("node:assert/strict");
let checks = 0;
const eq = (a, b) => {
  A.equal(a, b);
  checks++;
};
const match = (a, b) => {
  A.match(a, b);
  checks++;
};
const root = path.resolve(__dirname, "..");
process.chdir(root);
const { bootApp } = require(root + "/qa/build2-source-harness.cjs");
let html = fs.readFileSync("night-sweep/shell.html", "utf8");
const builder = fs.readFileSync("night-sweep/build.py", "utf8");
const entries = [
  ...builder.matchAll(/\('(<!--[A-Z]+-->)',\s*'([^']+)'\)/g),
].map(([, a, b]) => [a, b]);
entries.push(
  ["<!--ROUTEWORKBENCHCSS-->", "route-workbench.css"],
  ["<!--ROUTEWORKBENCH-->", "route-workbench.js"],
);
for (const [token, file] of entries) {
  let data = fs.readFileSync("night-sweep/" + file, "utf8");
  if (file === "catalog.json") {
    const c = JSON.parse(data);
    c.setupManuals = JSON.parse(
      fs.readFileSync("night-sweep/setup-manuals.json"),
    );
    data = JSON.stringify(c);
  }
  html = html.replace(token, () => data);
}
html = html
  .replace("<!--DSIMPILOTCODES-->", () =>
    fs.readFileSync("night-sweep/dsim-pilot-codes.js", "utf8"),
  )
  .replace("<!--MAPIMPORTCSS-->", "")
  .replace("<!--MAPIMPORT-->", "")
  .replace(
    "<!--MAPIMPORTASSETS-->",
    '<script id="map-import-assets" type="application/json">{}</script>',
  );
if (process.env.NIGHTSWEEP_RELEASE_TEST === "1")
  html = fs.readFileSync(path.join(root, "outputs/Night_Sweep.html"), "utf8");
const a = bootApp({ html }),
  { ev, w, d } = a;
try {
  const reset = () =>
    ev(
      `state.setup={...state.setup,lowF:54,highF:860,lowLevel:10,highLevel:10,liveMax:860,launchMode:'sqrt'};state.rows=[{...freshRow('source','r1'),name:'Exact station',device:'active_gm_hgd',gainLowF:54,gainHighF:860,gainLow:35,gainHigh:35,targetLow:43,targetHigh:43}];delete state.mapLaunch;renderAll();`,
    );
  reset();
  ev(
    `state.rows[0].mapImport={kind:'active',status:'installed',connectionConfirmed:true,modelConfirmed:true,reviewResolved:true};renderAll()`,
  );
  const span = d.querySelector("[data-field=length]");
  span.value = "100";
  span.dispatchEvent(new w.Event("input", { bubbles: true }));
  eq(ev("state.rows[0].mapImport.connectionConfirmed"), false);
  eq(ev("state.rows[0].mapImport.reviewResolved"), false);
  eq(ev("HFC.run(state,catalog,54).results[0].input.level"), null);
  reset();
  ev(
    `state.rows[0].workbench={leg:'aux',legGain:{aux:{low:35,high:35,lowF:54,highF:860,limitLow:50,limitHigh:50}},records:{aux:{before:{low:{input:'10',output:'40',inputPlane:'port',outputPlane:'port',inputFrequency:54,outputFrequency:54}}}}};renderAll()`,
  );
  const select = d.querySelector("[data-field=device]");
  select.value = "active_gm_le_manual";
  select.dispatchEvent(new w.Event("change", { bubbles: true }));

  eq(ev("state.rows[0].device"), "active_gm_le_manual");
  eq(ev("state.rows[0].workbench"), undefined);
  eq(ev("state.rows[0].workbenchHistory[0].model"), "active_gm_hgd");
  eq(
    ev("state.rows[0].workbenchHistory[0].data.records.aux.before.low.input"),
    "10",
  );
  match(d.querySelector(".route-workbench").textContent, /Needs input/);
  eq(d.querySelector("[data-wb=leg]").value, "main");
  reset();
  ev(
    `state.rows[0].outputLimitLow=50;state.rows[0].outputLimitHigh=52;state.rows[0].outputLoss=2;renderAll()`,
  );
  const changed = d.querySelector("[data-field=device]");
  changed.value = "active_gm_le_manual";
  changed.dispatchEvent(new w.Event("change", { bubbles: true }));
  eq(ev("state.rows[0].outputLimitLow"), undefined);
  eq(ev("state.rows[0].outputLimitHigh"), undefined);
  eq(ev("state.rows[0].outputLoss"), undefined);
  eq(ev("state.rows[0].workbenchHistory[0].operating.outputLimitHigh"), 52);
  eq(ev("state.rows[0].workbenchHistory[0].operating.outputLoss"), 2);
  eq(ev("state.rows[0].targetHigh"), 43);
  ev(`state.rows[0].gainLow=35;state.rows[0].gainHigh=35;refreshResults()`);
  match(
    d.querySelector(".route-workbench").textContent,
    /Gain available · output limit unknown/,
  );
  A.deepEqual(a.errors, []);
  checks++;
  console.log(`Independent route RF UI: ${checks} checks passed`);
} finally {
  a.close();
}
