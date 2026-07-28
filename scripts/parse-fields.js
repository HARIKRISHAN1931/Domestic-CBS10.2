const fs   = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../test-results/debug-form-capture.html'), 'utf8');

// Match <select id="..." class="...">...</select>
const selectRe = /<select([^>]*)>([\s\S]*?)<\/select>/gi;
let m;
const rows = [];

while ((m = selectRe.exec(html)) !== null) {
  const attrs  = m[1];
  const inner  = m[2];
  const idM    = attrs.match(/id="([^"]+)"/);
  const clsM   = attrs.match(/class="([^"]+)"/);
  const nameM  = attrs.match(/name="([^"]+)"/);
  if (!idM) continue;
  const id   = idM[1];
  const cls  = clsM ? clsM[1] : '';
  const name = nameM ? nameM[1] : '';
  const isS2 = cls.includes('select2-hidden-accessible');

  // skip system/menu selects
  if (['level1','level2','qmenul1l2'].includes(id)) continue;

  const optRe = /<option[^>]*value="([^"]*)"[^>]*>([^<]*)<\/option>/gi;
  let om;
  const opts = [];
  while ((om = optRe.exec(inner)) !== null) {
    const v = om[1].trim();
    const t = om[2].trim();
    if (t && v) opts.push(`"${v}"=>"${t}"`);
  }
  if (opts.length === 0) continue;

  rows.push({
    type: isS2 ? 'SELECT2' : 'NATIVE',
    id, name,
    opts: opts.slice(0, 10).join(' | ') + (opts.length > 10 ? ` ...(${opts.length} total)` : '')
  });
}

console.log('\n=== EMPLOYEE MASTER — ALL DROPDOWN FIELDS ===\n');
rows.forEach(r => {
  console.log(`[${r.type}] id="${r.id}" name="${r.name}"`);
  console.log(`  options: ${r.opts}`);
  console.log('');
});
