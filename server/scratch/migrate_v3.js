import pool from '../src/config/db.js';

async function migrate() {
    try {
        console.log('Starting migration...');
        
        // Add registration_number if it doesn't exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50);
        `);
        
        // Add is_approved if it doesn't exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
        `);

        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
