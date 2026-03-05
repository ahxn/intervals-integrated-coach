import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('[v0] DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function migrate() {
  try {
    const migrationPath = path.join(process.cwd(), 'scripts', '001-create-tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('[v0] Executing:', statement.substring(0, 50) + '...');
        await sql(statement);
      }
    }
    
    console.log('[v0] Migration completed successfully');
  } catch (error) {
    console.error('[v0] Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
