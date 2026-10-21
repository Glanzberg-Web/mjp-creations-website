"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const pages = ["index.html", "services.html", "about.html"];
const sources = ["script.js", "catalog-config.js", "api/contact.js"];
const root = path.resolve(__dirname, "..");

for (const file of sources) {
  execFileSync(process.execPath, ["--check", path.join(root, file)], {stdio:"pipe"});
  console.log("✓ JavaScript syntax:", file);
}

const htmlByPath = new Map(pages.map(file => [file, fs.readFileSync(path.join(root,file),"utf8")]));
const idsByPath = new Map();
for (const [file, html] of htmlByPath) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, "Duplicate ids in " + file);
  idsByPath.set(file,new Set(ids));
  assert(html.includes('name="viewport"'), "Missing viewport in " + file);
  assert(html.includes('href="/styles.css"'), "Missing stylesheet in " + file);
}

for (const [file, html] of htmlByPath) {
  const urls = [...html.matchAll(/\bhref="([^"]+)"/g)].map(match => match[1]);
  for (const url of urls) {
    if (/^(https?:|mailto:|tel:|\/\/)/.test(url)) continue;
    if (!url.startsWith("/") && !url.startsWith("#")) continue;
    const [filePart, fragment] = url.split("#");
    const target = !filePart || filePart === "/"
      ? (filePart === "/" ? "index.html" : file)
      : filePart.startsWith("/") ? filePart.slice(1) : filePart;
    assert(fs.existsSync(path.join(root, target)), "Broken local file link: " + file + " => " + url);
    if (fragment && idsByPath.has(target)) {
      assert(idsByPath.get(target).has(fragment), "Broken anchor: " + file + " => " + url);
    }
  }
  console.log("✓ Internal links and anchors:", file);
}

const home = htmlByPath.get("index.html");
for (const route of ["apparel-top.htm","bags-top.htm","drinkware-top.htm","eco-friendly-top.htm","technology-top.htm","office-top.htm"]) {
  assert(home.includes('data-catalog-path="' + route + '"'), "Missing verified catalog route: " + route);
}
assert(home.includes('id="contact-form"') && home.includes('action="/api/contact"'), "Contact form not wired up");
const handler = fs.readFileSync(path.join(root,"api/contact.js"),"utf8");
for (const name of ["RESEND_API_KEY","MJP_CONTACT_TO","MJP_CONTACT_FROM"]) {
  assert(handler.includes("process.env." + name), "Missing environment variable: " + name);
}
JSON.parse(fs.readFileSync(path.join(root,"vercel.json"),"utf8"));
console.log("✓ Catalog, contact, and deployment configuration");
console.log("All checks passed.");