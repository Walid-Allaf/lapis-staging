import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
import { assertDatabaseWriteAllowed } from '../../server/backend/config.ts';
import { getPool, closePool } from '../../server/backend/db/pool.ts';
import { migrateDatabase } from '../../server/backend/db/migrate.ts';
import { initializeCleanDatabase } from '../../server/backend/db/initialize.ts';
import { previewProductionMaintenance } from '../../server/backend/db/production-maintenance.ts';
import { bootstrapAdministrator } from '../../server/backend/auth/bootstrap.ts';
import { AuthenticationService } from '../../server/backend/modules/auth/service.ts';
import { readAuthConfig } from '../../server/backend/auth/config.ts';
import { query } from '../../server/backend/db/parameters.ts';
import { acquireApplicationLock } from '../../server/backend/db/lock.ts';

test('Phase7 production policy on a fresh local SQL staging simulation', { skip: process.env.SQL_ALLOW_TESTS !== 'true' && 'Dedicated SQL test credentials required', timeout: 120000 }, async t => {
  assertDatabaseWriteAllowed('test');
  const pool = await getPool(), root = await fs.mkdtemp(path.join(os.tmpdir(), 'lapis-phase7-maintenance-'));
  // Only the already-connected TEST pool trusts the local self-signed certificate.
  // Production policy/CLI configuration ALWAYS retains encrypt=true, trust=false.
  const env = { ...process.env, NODE_ENV:'production', SQL_ENV:'production', SQL_ENCRYPT:'true', SQL_TRUST_SERVER_CERTIFICATE:'false',
    SQL_MAINTENANCE_ALLOW:'true', SQL_ALLOW_MIGRATIONS:'true', SQL_ALLOW_SEED:'true', SQL_CLEAN_START_CONFIRM:'INITIALIZE_EMPTY_LAPIS',
    AUTH_BOOTSTRAP_ALLOW:'true', AUTH_BOOTSTRAP_CONFIRM:'CREATE_FIRST_SUPERADMIN' };
  let sequence = 0;
  async function plan(operation) {
    env.SQL_MAINTENANCE_OPERATION = operation;
    env.SQL_MAINTENANCE_CONFIRM = `APPLY:${operation}:${env.SQL_DATABASE}`;
    env.SQL_MAINTENANCE_PLAN_FILE = path.join(root, `plan-${++sequence}.json`);
    const value = await previewProductionMaintenance(pool, env);
    env.SQL_MAINTENANCE_PLAN_SHA256 = value.sha256;
    delete env.SQL_MAINTENANCE_BACKUP_FILE;
    return value;
  }
  async function backup(value) {
    env.SQL_MAINTENANCE_BACKUP_FILE = path.join(root, `backup-${sequence}.json`);
    await fs.writeFile(env.SQL_MAINTENANCE_BACKUP_FILE, JSON.stringify({ targetFingerprint:value.state.targetFingerprint, planSha256:value.sha256,
      verified:true, reference:'TEST ONLY: policy receipt, not a physical backup', completedAt:new Date().toISOString() }), { mode:0o600 });
  }
  const step = async (name, fn) => { let ok=false; await t.test(name,async()=>{await fn();ok=true;});if(!ok)throw Error('Release prerequisite failed: '+name); };
  try {
    assert.equal((await query(pool,'SELECT COUNT(*) AS n FROM sys.tables WHERE is_ms_shipped=0;')).recordset[0].n,0);
    await step('preview is read-only; default production and missing authorization remain denied',async()=>{
      assert.throws(()=>assertDatabaseWriteAllowed('migrate',env));
      await plan('migrate');
      assert.equal((await query(pool,'SELECT COUNT(*) AS n FROM sys.tables WHERE is_ms_shipped=0;')).recordset[0].n,0);
      await assert.rejects(migrateDatabase(pool,{env:{...env,SQL_MAINTENANCE_ALLOW:'false'}}));
      await assert.rejects(migrateDatabase(pool,{env:{...env,SQL_MAINTENANCE_PLAN_SHA256:'0'.repeat(64)}}));
      await assert.rejects(migrateDatabase(pool,{env:{...env,SQL_EXPECT_DATABASE:'wrong'}}));
      await assert.rejects(migrateDatabase(pool,{env,directory:root}));
    });
    await step('expired and tampered plan files fail closed before schema creation',async()=>{
      const file=JSON.parse(await fs.readFile(env.SQL_MAINTENANCE_PLAN_FILE,'utf8'));
      await fs.writeFile(env.SQL_MAINTENANCE_PLAN_FILE,JSON.stringify({...file,expiresAt:'2000-01-01T00:00:00.000Z'}));
      await assert.rejects(migrateDatabase(pool,{env}));
      const expired={...file};delete expired.sha256;expired.createdAt=new Date(Date.now()-3600000).toISOString();expired.expiresAt=new Date(Date.parse(expired.createdAt)+1800000).toISOString();
      const digest=createHash('sha256').update(JSON.stringify(expired)).digest('hex');
      await fs.writeFile(env.SQL_MAINTENANCE_PLAN_FILE,JSON.stringify({...expired,sha256:digest}));
      await assert.rejects(migrateDatabase(pool,{env:{...env,SQL_MAINTENANCE_PLAN_SHA256:digest}}));await plan('migrate');
    });
    await step('another lock owner prevents migrations; authorized seven checksummed files apply',async()=>{
      const tx=pool.transaction();await tx.begin();await acquireApplicationLock(tx,'LAPiS:foundation:migrations');
      try{await assert.rejects(migrateDatabase(pool,{env}),{code:'DB_LOCK_UNAVAILABLE'});}finally{await tx.rollback();}
      assert.deepEqual(await migrateDatabase(pool,{env}),{applied:7,total:7});
      const rows=(await query(pool,'SELECT Version,Status,DATALENGTH(Checksum) AS bytes FROM dbo.SchemaMigrations ORDER BY Version;')).recordset;
      assert.deepEqual(rows.map(x=>x.Version),[1,2,3,4,5,6,7]);assert.ok(rows.every(x=>x.Status==='applied'&&x.bytes===32));
      assert.equal((await query(pool,'SELECT COUNT(*) AS n FROM sys.tables WHERE is_ms_shipped=0;')).recordset[0].n,19);
    });
    await step('stale plan rejected; fresh current preview supports migration idempotency',async()=>{
      await assert.rejects(migrateDatabase(pool,{env}));await plan('migrate');
      assert.deepEqual(await migrateDatabase(pool,{env}),{applied:0,total:7});
    });
    await step('existing six-version staging fixture refuses pending production migration without matching backup receipt',async()=>{
      // Dedicated disposable test target only: simulate a previously deployed six-migration schema.
      await query(pool,'DROP INDEX UX_BlogPosts_SlugHash ON dbo.BlogPosts; DELETE dbo.SchemaMigrations WHERE Version=7;');
      const value=await plan('migrate');assert.equal(value.state.status.pending,1);
      await assert.rejects(migrateDatabase(pool,{env}));await backup(value);
      const receipt=JSON.parse(await fs.readFile(env.SQL_MAINTENANCE_BACKUP_FILE,'utf8'));
      await fs.writeFile(env.SQL_MAINTENANCE_BACKUP_FILE,JSON.stringify({...receipt,targetFingerprint:'wrong'}));
      await assert.rejects(migrateDatabase(pool,{env}));await fs.writeFile(env.SQL_MAINTENANCE_BACKUP_FILE,JSON.stringify(receipt));
      assert.deepEqual(await migrateDatabase(pool,{env}),{applied:1,total:7});
    });
    await step('existing database requires reviewed backup receipt; clean initialization creates only neutral records',async()=>{
      await query(pool,"INSERT dbo.Roles(Code,ContractValue,ContractValueKind) VALUES(N'unknown',N'Unknown',N'string');");
      let value=await plan('initialize');await backup(value);await assert.rejects(initializeCleanDatabase(pool,env));
      assert.equal((await query(pool,'SELECT COUNT(*) AS n FROM dbo.SiteSettings;')).recordset[0].n,0);
      await query(pool,"DELETE dbo.Roles WHERE Code=N'unknown';");
      value=await plan('initialize');await assert.rejects(initializeCleanDatabase(pool,env));await backup(value);
      assert.deepEqual(await initializeCleanDatabase(pool,env),{applied:true});
      const row=(await query(pool,`SELECT (SELECT COUNT(*) FROM dbo.Users) AS users,(SELECT COUNT(*) FROM dbo.Files) AS files,
        (SELECT COUNT(*) FROM dbo.Roles) AS roles,(SELECT COUNT(*) FROM dbo.Services) AS services,
        (SELECT COUNT(*) FROM dbo.SiteSettings WHERE Id=1 AND PhoneNumber IS NULL AND ServicesTabToggle=0) AS settings,
        (SELECT COUNT(*) FROM dbo.Ads WHERE Id=1 AND Text IS NULL AND IsActive=0) AS ads;`)).recordset[0];
      assert.deepEqual(row,{users:0,files:0,roles:3,services:0,settings:1,ads:1});
      const next=await plan('initialize');await backup(next);assert.deepEqual(await initializeCleanDatabase(pool,env),{applied:false});
    });
    const account={email:'phase7-operator@example.invalid',password:randomBytes(24).toString('base64url')};
    await step('operator supplied first admin is secure, logged and authenticates using production policy',async()=>{
      const value=await plan('bootstrap');await backup(value);
      await assert.rejects(bootstrapAdministrator(pool,{...account,password:'weak'},env));
      assert.deepEqual(await bootstrapAdministrator(pool,account,env),{applied:true});
      assert.equal((await query(pool,"SELECT COUNT(*) AS n FROM dbo.SecurityEvents WHERE EventType=N'AdminBootstrap' AND Outcome=N'allowed';")).recordset[0].n,1);
      const service=new AuthenticationService(pool,readAuthConfig(),()=>({async sendOtp(){throw Error('No SMTP permitted');}}));
      const login=await service.login(account);assert.ok(login);
    });
    await step('new plans cannot create another admin or reset existing password; clean init refuses occupied database',async()=>{
      let value=await plan('bootstrap');await backup(value);
      assert.deepEqual(await bootstrapAdministrator(pool,{...account,password:randomBytes(24).toString('base64url')},env),{applied:false});
      await assert.rejects(bootstrapAdministrator(pool,{...account,email:'second@example.invalid'},env),{status:409});
      value=await plan('initialize');await backup(value);await assert.rejects(initializeCleanDatabase(pool,env));
    });
    console.log(JSON.stringify({productionPolicy:true,actualProductionTLS:'NOT TESTED: injected local test pool',hostedWrites:0,importedRows:0}));
  }finally{await closePool();await fs.rm(root,{recursive:true,force:true});}
});
