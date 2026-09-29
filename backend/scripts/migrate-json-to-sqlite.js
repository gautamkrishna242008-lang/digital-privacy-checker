// One-time migration: pulls any existing entries out of
// src/data/checks.json and inserts them into the new SQLite database.
// Safe to run more than once — existing IDs are just overwritten.
//
// Usage: npm run migrate

const fs = require("fs");
const path = require("path");
const { saveCheck } = require("../src/db");

const OLD_FILE = path.join(__dirname, "..", "src", "data", "checks.json");

function main() {
  if (!fs.existsSync(OLD_FILE)) {
    console.log("No checks.json found — nothing to migrate.");
    return;
  }

  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(OLD_FILE, "utf-8"));
  } catch (err) {
    console.error("Couldn't parse checks.json:", err.message);
    process.exitCode = 1;
    return;
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    console.log("checks.json is empty — nothing to migrate.");
    return;
  }

  console.log(`Found ${entries.length} entr${entries.length === 1 ? "y" : "ies"} in checks.json. Migrating...`);

  let migrated = 0;
  // Insert oldest-first so ordering by created_at stays sensible either way.
  for (const entry of entries.slice().reverse()) {
    try {
      saveCheck(entry);
      migrated++;
    } catch (err) {
      console.error(`Skipped entry ${entry.id || "(no id)"}:`, err.message);
    }
  }

  console.log(`Migrated ${migrated}/${entries.length} entries into SQLite.`);
  console.log("You can now safely delete or archive src/data/checks.json if you like.");
}

main();
