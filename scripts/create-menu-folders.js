/**
 * scripts/create-menu-folders.js
 *
 * Reads scripts/menu-structure.json (produced by capture-menus.ts)
 * and creates the full src/modules/ folder tree matching CBS menu navigation.
 *
 * Folder naming: label-based (human readable), sanitised for filesystem.
 * Also writes a menu-map.json mapping folderPath → { topId, subId, itemId }
 * so Page classes can reference the correct menuPath.
 *
 * Run:
 *   node scripts/create-menu-folders.js
 */

const fs   = require('fs');
const path = require('path');

const MENU_JSON  = path.join(__dirname, 'menu-structure.json');
const MODULES_DIR = path.join(__dirname, '..', 'src', 'modules');
const MAP_OUT    = path.join(__dirname, 'menu-map.json');

// ── Sanitise label → folder name ─────────────────────────────────────────────
// Keeps letters, digits, spaces → replaces spaces with hyphens → TitleCase words
function toFolderName(label) {
  return label
    .replace(/[^a-zA-Z0-9 ]/g, '')   // remove special chars
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');                         // PascalCase — matches our design convention
}

// ── Main ──────────────────────────────────────────────────────────────────────
if (!fs.existsSync(MENU_JSON)) {
  console.error(`❌  menu-structure.json not found at: ${MENU_JSON}`);
  console.error(`    Run first: ENV=uat npx ts-node scripts/capture-menus.ts`);
  process.exit(1);
}

const structure = JSON.parse(fs.readFileSync(MENU_JSON, 'utf-8'));
const menuMap   = {};
let   created   = 0;
let   skipped   = 0;

console.log(`\n📂  Creating module folders under: ${MODULES_DIR}\n`);

for (const top of structure) {
  const topFolder = toFolderName(top.label);

  for (const sub of top.subSections) {
    const subFolder = toFolderName(sub.label);

    for (const item of sub.items) {
      const itemFolder = toFolderName(item.label);
      const folderPath = path.join(MODULES_DIR, topFolder, subFolder, itemFolder);

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`  ✅  ${topFolder}/${subFolder}/${itemFolder}`);
        created++;
      } else {
        skipped++;
      }

      // Record mapping: relative path → menu IDs
      const relPath = `${topFolder}/${subFolder}/${itemFolder}`;
      menuMap[relPath] = {
        topId:    top.id,
        topLabel: top.label,
        subId:    sub.id,
        subLabel: sub.label,
        itemId:   item.id,
        itemLabel: item.label,
      };
    }
  }
}

fs.writeFileSync(MAP_OUT, JSON.stringify(menuMap, null, 2), 'utf-8');

console.log(`\n✅  Done`);
console.log(`   Folders created : ${created}`);
console.log(`   Already existed : ${skipped}`);
console.log(`   Menu map saved  : ${MAP_OUT}`);
