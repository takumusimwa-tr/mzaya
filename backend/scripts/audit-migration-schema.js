// backend/scripts/audit-migration-schema.js
// Batch 08.6.6D.1 — READ-ONLY deep schema drift audit.
// Compares columns declared in CREATE TABLE / ALTER TABLE ADD COLUMN migrations
// with the live PostgreSQL schema. It executes no migration SQL and performs no DDL.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/config/db');
const { QueryTypes } = require('sequelize');

const DIR = path.resolve(__dirname, '../migrations');

function splitTopLevel(body) {
  const parts=[]; let start=0, depth=0, quote=null;
  for (let i=0;i<body.length;i++) {
    const c=body[i], n=body[i+1];
    if (quote) {
      if (c===quote && n===quote) { i++; continue; }
      if (c===quote) quote=null;
      continue;
    }
    if (c==="'" || c==='"') { quote=c; continue; }
    if (c==='(') depth++;
    else if (c===')') depth=Math.max(0,depth-1);
    else if (c===',' && depth===0) { parts.push(body.slice(start,i)); start=i+1; }
  }
  parts.push(body.slice(start));
  return parts;
}

function cleanIdent(s) { return s.replace(/^["']|["']$/g,'').toLowerCase(); }

function parseCreateTables(sql) {
  const out=[];
  const re=/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(?:"?public"?\.)?)(["\w]+)\s*\(/ig;
  let m;
  while ((m=re.exec(sql))) {
    const table=cleanIdent(m[1]); let i=re.lastIndex, depth=1, quote=null;
    for (;i<sql.length && depth>0;i++) {
      const c=sql[i], n=sql[i+1];
      if (quote) {
        if (c===quote && n===quote) { i++; continue; }
        if (c===quote) quote=null;
        continue;
      }
      if (c==="'" || c==='"') { quote=c; continue; }
      if (c==='(') depth++; else if (c===')') depth--;
    }
    const body=sql.slice(re.lastIndex,i-1);
    const columns=[];
    for (const raw of splitTopLevel(body)) {
      const x=raw.trim();
      if (!x || /^(CONSTRAINT|PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN\s+KEY|EXCLUDE)\b/i.test(x)) continue;
      const cm=x.match(/^("?[\w]+"?)\s+(.+)$/s);
      if (cm) columns.push(cleanIdent(cm[1]));
    }
    out.push({table,columns});
    re.lastIndex=i;
  }
  return out;
}

function parseAlterColumns(sql) {
  const out=[];
  const re=/ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:(?:"?public"?\.)?)(["\w]+)([\s\S]*?);/ig;
  let m;
  while ((m=re.exec(sql))) {
    const table=cleanIdent(m[1]), body=m[2];
    const add=/ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?("?[\w]+"?)/ig;
    let a; while ((a=add.exec(body))) out.push({table,column:cleanIdent(a[1])});
  }
  return out;
}

(async()=>{
  try {
    await sequelize.authenticate();
    const files=fs.readdirSync(DIR).filter(f=>f.endsWith('.sql')).sort();
    const actualRows=await sequelize.query(
      `SELECT table_name, column_name
         FROM information_schema.columns
        WHERE table_schema='public'`,
      {type:QueryTypes.SELECT}
    );
    const actual=new Map();
    for (const r of actualRows) {
      if (!actual.has(r.table_name)) actual.set(r.table_name,new Set());
      actual.get(r.table_name).add(r.column_name);
    }

    console.log('\nDEEP MIGRATION SCHEMA DRIFT AUDIT (READ ONLY)\n');
    let clean=0, drift=0, absent=0;
    for (const file of files) {
      const sql=fs.readFileSync(path.join(DIR,file),'utf8');
      const expected=new Map();
      for (const t of parseCreateTables(sql)) {
        if (!expected.has(t.table)) expected.set(t.table,new Set());
        for (const c of t.columns) expected.get(t.table).add(c);
      }
      for (const a of parseAlterColumns(sql)) {
        if (!expected.has(a.table)) expected.set(a.table,new Set());
        expected.get(a.table).add(a.column);
      }
      if (!expected.size) continue;

      const missingTables=[], missingColumns=[];
      for (const [table,cols] of expected) {
        if (!actual.has(table)) { missingTables.push(table); continue; }
        for (const col of cols) if (!actual.get(table).has(col)) missingColumns.push(`${table}.${col}`);
      }

      if (missingTables.length) {
        absent++;
        console.log(`ABSENT_OR_NEW   ${file}`);
        for (const t of missingTables) console.log(`  MISSING TABLE  ${t}`);
        for (const c of missingColumns) console.log(`  MISSING COLUMN ${c}`);
      } else if (missingColumns.length) {
        drift++;
        console.log(`COLUMN_DRIFT    ${file}`);
        for (const c of missingColumns) console.log(`  MISSING COLUMN ${c}`);
      } else {
        clean++;
        console.log(`COLUMNS_PRESENT ${file}`);
      }
    }
    console.log(`\nSummary: ${clean} columns-present, ${drift} column-drift, ${absent} absent/new.`);
    console.log('No migration SQL was executed. No schema changes were made.\n');
    await sequelize.close();
  } catch(e) {
    try { await sequelize.close(); } catch (_) {}
    console.error('Deep schema audit failed:', e.message);
    process.exit(1);
  }
})();
