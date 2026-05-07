import pool from '../src/config/db.js';

async function checkColumns() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('Columns in users table:');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkColumns();
