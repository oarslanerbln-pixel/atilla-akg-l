// Tells Bing (and every engine in IndexNow) which pages changed, so ChatGPT search and Copilot,
// which read Bing's index, see a change within days instead of whenever Bing next crawls.
//
//   node scripts/indexnow.mjs            submit the pages whose content changed since the last run
//   node scripts/indexnow.mjs --all      submit every page in the sitemap
//   node scripts/indexnow.mjs --dry-run  show what would be submitted, change nothing
//
// Runs in .github/workflows/indexnow.yml after each production deploy and once a day. IndexNow
// asks for changed URLs only, and the sitemap stamps every page with the build time, so a page
// counts as changed when its fingerprint does: title, description, canonical, structured data
// and visible text. The fingerprints of the last successful run live in .indexnow/state.json.

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";

const SITE = process.env.INDEXNOW_SITE ?? "https://atillabarbarossa.com";
const STATE_FILE = ".indexnow/state.json";
const ENDPOINT = "https://api.indexnow.org/indexnow";

const args = new Set(process.argv.slice(2));
const submitAll = args.has("--all");
const dryRun = args.has("--dry-run");

/** The key is the name of its own file in public/, as IndexNow verifies it at /<key>.txt. */
async function readKey() {
  const name = (await readdir("public")).find((file) => /^[a-f0-9]{32}\.txt$/.test(file));
  if (!name) throw new Error("No IndexNow key file (public/<32 hex>.txt)");
  return name.slice(0, -4);
}

async function fetchText(url) {
  const response = await fetch(url, { redirect: "manual", headers: { "User-Agent": "atillabarbarossa-indexnow" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

const first = (html, pattern) => html.match(pattern)?.[1] ?? "";

/** What an engine indexes, without the build's chunk names and script payloads. */
function fingerprint(html) {
  const structured = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = [
    first(html, /<title>([^<]*)<\/title>/),
    first(html, /<meta name="description" content="([^"]*)"/),
    first(html, /<link rel="canonical" href="([^"]*)"/),
    ...structured,
    text,
  ];
  return createHash("sha256").update(parts.join("\n")).digest("hex");
}

async function readState() {
  try {
    return JSON.parse(await readFile(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function main() {
  const key = await readKey();
  const keyLocation = `${SITE}/${key}.txt`;

  // A deploy that is not live yet would make IndexNow reject the key; nothing is submitted then.
  if ((await fetchText(keyLocation)).trim() !== key) throw new Error(`${keyLocation} does not serve the key`);

  const sitemap = await fetchText(`${SITE}/sitemap.xml`);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!urls.length) throw new Error("The sitemap lists no pages");

  const previous = await readState();
  const current = {};
  const changed = [];
  for (const url of urls) {
    current[url] = fingerprint(await fetchText(url));
    if (submitAll || previous[url] !== current[url]) changed.push(url);
  }

  console.log(`${urls.length} pages in the sitemap, ${changed.length} to submit${submitAll ? " (--all)" : ""}`);
  for (const url of changed) console.log(`  ${url}`);
  if (dryRun || !changed.length) {
    if (!dryRun) await saveState(current);
    return;
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation, urlList: changed }),
  });
  // 200: accepted; 202: accepted, key check still pending. Anything else is not saved, so the
  // same pages are offered again on the next run.
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow answered ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
  console.log(`IndexNow accepted the submission (HTTP ${response.status})`);
  await saveState(current);
}

async function saveState(state) {
  await mkdir(".indexnow", { recursive: true });
  await writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
