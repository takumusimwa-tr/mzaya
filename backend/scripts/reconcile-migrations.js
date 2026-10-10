// backend/scripts/reconcile-migrations.js
// Batch 08.6.6C companion: READ-ONLY migration/schema reconciliation.
// It parses repository SQL for common PostgreSQL objects, reads PostgreSQL
// catalogues, and reports evidence. It never executes migration SQL or DDL/DML.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs=require('fs'), path=require('path');
const { sequelize }=require('../src/config/db');
const { QueryTypes }=require('sequelize');
const DIR=path.resolve(__dirname,'../migrations');

const clean=s=>s.replace(/"/g,'').toLowerCase();
function uniq(xs){return [...new Set(xs.map(clean))].sort();}
function parse(sql){
  const tables=[], views=[], indexes=[], functions=[], columns=[], constraints=[];
  let m;
  const patterns=[
    [/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(?:public)\.)?("?[\w]+"?)/gi,tables],
    [/CREATE\s+(?:OR\s+REPLACE\s+)?(?:MATERIALIZED\s+)?VIEW\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(?:public)\.)?("?[\w]+"?)/gi,views],
    [/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?("?[\w]+"?)/gi,indexes],
    [/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:(?:public)\.)?("?[\w]+"?)/gi,functions],
  ];
  for(const [re,out] of patterns) while((m=re.exec(sql))) out.push(m[1]);

  const addCol=/ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:(?:public)\.)?("?[\w]+"?)[\s\S]{0,220}?ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?("?[\w]+"?)/gi;
  while((m=addCol.exec(sql))) columns.push(`${clean(m[1])}.${clean(m[2])}`);
  const addConstraint=/ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:(?:public)\.)?("?[\w]+"?)[\s\S]{0,220}?ADD\s+CONSTRAINT\s+("?[\w]+"?)/gi;
  while((m=addConstraint.exec(sql))) constraints.push(`${clean(m[1])}.${clean(m[2])}`);

  return {tables:uniq(tables),views:uniq(views),indexes:uniq(indexes),functions:uniq(functions),
    columns:uniq(columns),constraints:uniq(constraints)};
}
async function catalog(){
  const q=async(sql)=>sequelize.query(sql,{type:QueryTypes.SELECT});
  const [tables,views,indexes,columns,constraints,functions]=await Promise.all([
    q(`SELECT table_name name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`),
    q(`SELECT table_name name FROM information_schema.views WHERE table_schema='public' UNION SELECT matviewname name FROM pg_matviews WHERE schemaname='public'`),
    q(`SELECT indexname name FROM pg_indexes WHERE schemaname='public'`),
    q(`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public'`),
    q(`SELECT tc.table_name, tc.constraint_name FROM information_schema.table_constraints tc WHERE tc.table_schema='public'`),
    q(`SELECT p.proname name FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'`)
  ]);
  return {
    tables:new Set(tables.map(x=>clean(x.name))),views:new Set(views.map(x=>clean(x.name))),
    indexes:new Set(indexes.map(x=>clean(x.name))),functions:new Set(functions.map(x=>clean(x.name))),
    columns:new Set(columns.map(x=>`${clean(x.table_name)}.${clean(x.column_name)}`)),
    constraints:new Set(constraints.map(x=>`${clean(x.table_name)}.${clean(x.constraint_name)}`))
  };
}
function check(expected,actual){
  const all=[...expected.tables.map(x=>['table',x,actual.tables.has(x)]),
    ...expected.views.map(x=>['view',x,actual.views.has(x)]),
    ...expected.indexes.map(x=>['index',x,actual.indexes.has(x)]),
    ...expected.functions.map(x=>['function',x,actual.functions.has(x)]),
    ...expected.columns.map(x=>['column',x,actual.columns.has(x)]),
    ...expected.constraints.map(x=>['constraint',x,actual.constraints.has(x)])];
  const missing=all.filter(x=>!x[2]), present=all.filter(x=>x[2]);
  let verdict='MANUAL_REVIEW';
  if(all.length && !missing.length) verdict='BASELINE_CANDIDATE';
  else if(missing.length) verdict='EXECUTION_OR_REPAIR_REQUIRED';
  return {all,present,missing,verdict};
}
(async()=>{
  try{
    await sequelize.authenticate();
    // PostgreSQL read-only transaction protects against accidental writes in this checker.
    const tx=await sequelize.transaction();
    try{
      await sequelize.query('SET TRANSACTION READ ONLY',{transaction:tx});
      const actual=await catalog();
      const names=fs.readdirSync(DIR).filter(f=>f.endsWith('.sql')).sort();
      let counts={BASELINE_CANDIDATE:0,EXECUTION_OR_REPAIR_REQUIRED:0,MANUAL_REVIEW:0};
      console.log('\nMigration reconciliation (READ ONLY)\n');
      for(const f of names){
        const expected=parse(fs.readFileSync(path.join(DIR,f),'utf8'));
        const r=check(expected,actual); counts[r.verdict]++;
        console.log(`${r.verdict.padEnd(28)} ${f}`);
        for(const [type,name] of r.missing) console.log(`  MISSING ${type.padEnd(10)} ${name}`);
        if(!r.all.length) console.log('  No safely parseable schema object signature; inspect SQL manually.');
      }
      console.log('\nSummary');
      Object.entries(counts).forEach(([k,v])=>console.log(`  ${k}: ${v}`));
      console.log('\nNo migration SQL was executed. No schema changes were made.\n');
      await tx.rollback();
    }catch(e){await tx.rollback();throw e;}
    await sequelize.close();
  }catch(e){try{await sequelize.close();}catch{} console.error('Reconciliation failed:',e.message);process.exit(1);}
})();
