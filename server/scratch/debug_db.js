import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkData() {
    try {
        const users = await pool.query('SELECT count(*) FROM users');
        const questions = await pool.query('SELECT count(*) FROM questions');
        const tags = await pool.query('SELECT count(*) FROM tags');
        const reports = await pool.query('SELECT count(*) FROM reports');
        
        console.log('--- DATABASE STATS ---');
        console.log('Users:', users.rows[0].count);
        console.log('Questions:', questions.rows[0].count);
        console.log('Tags:', tags.rows[0].count);
        console.log('Reports:', reports.rows[0].count);
        
        const admin = await pool.query("SELECT * FROM users WHERE role = 'admin'");
        console.log('--- ADMIN USERS ---');
        console.log(admin.rows);

        const unapproved = await pool.query("SELECT count(*) FROM users WHERE is_approved = FALSE");
        console.log('Unapproved users:', unapproved.rows[0].count);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkData();
