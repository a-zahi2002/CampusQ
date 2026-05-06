import pg from 'pg';
import bcrypt from 'bcrypt';
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

async function seed() {
    console.log('Starting database seeding...');
    try {
        // 1. Clear existing data (in correct order due to FK constraints)
        console.log('Cleaning up existing data...');
        await pool.query('TRUNCATE TABLE reports, ratings, user_interests, question_tags, tags, comments, answers, questions, users RESTART IDENTITY CASCADE;');

        // 2. Create Users
        console.log('Creating users...');
        const saltRounds = 10;
        const hashedPasswords = {
            admin: await bcrypt.hash('admin123', saltRounds),
            student: await bcrypt.hash('student123', saltRounds),
            lecturer: await bcrypt.hash('lecturer123', saltRounds),
        };

        const usersResult = await pool.query(`
            INSERT INTO users (email, password, nickname, role, points)
            VALUES 
            ('admin@campusq.com', $1, 'AdminUser', 'admin', 100),
            ('student1@campusq.com', $2, 'JohnDoe', 'student', 50),
            ('student2@campusq.com', $2, 'JaneSmith', 'student', 30),
            ('lecturer1@campusq.com', $3, 'DrProfessor', 'lecturer', 200),
            ('lecturer2@campusq.com', $3, 'ProfessorX', 'lecturer', 150)
            RETURNING id, email, nickname;
        `, [hashedPasswords.admin, hashedPasswords.student, hashedPasswords.lecturer]);

        const users = {};
        usersResult.rows.forEach(u => {
            users[u.nickname] = u.id;
        });

        // 3. Create Tags
        console.log('Creating tags...');
        const tagsResult = await pool.query(`
            INSERT INTO tags (name)
            VALUES ('Computer Science'), ('Mathematics'), ('Physics'), ('Chemistry'), ('Campus Life'), ('Exam Tips'), ('Programming'), ('AI')
            RETURNING id, name;
        `);

        const tags = {};
        tagsResult.rows.forEach(t => {
            tags[t.name] = t.id;
        });

        // 4. Create User Interests
        console.log('Linking users to interests...');
        await pool.query(`
            INSERT INTO user_interests (user_id, tag_id)
            VALUES 
            ($1, $2), ($1, $3), -- JohnDoe likes CS and Programming
            ($4, $5), ($4, $2)  -- JaneSmith likes Campus Life and CS
        `, [users['JohnDoe'], tags['Computer Science'], tags['Programming'], users['JaneSmith'], tags['Campus Life']]);

        // 5. Create Questions
        console.log('Creating questions...');
        const q1 = await pool.query(`
            INSERT INTO questions (user_id, title, body)
            VALUES ($1, 'How to optimize recursive functions in Python?', 'I am working on a project and my recursive functions are hitting recursion limits. Any tips?')
            RETURNING id;
        `, [users['JohnDoe']]);

        const q2 = await pool.query(`
            INSERT INTO questions (user_id, title, body)
            VALUES ($1, 'What are the best study spots on campus for night owls?', 'The main library closes at 10 PM. Are there any 24/7 labs or lounges?')
            RETURNING id;
        `, [users['JaneSmith']]);

        const q3 = await pool.query(`
            INSERT INTO questions (user_id, title, body)
            VALUES ($1, 'Explanation of Quantum Entanglement?', 'Can someone explain it in simple terms? I am struggling with my Physics 101 course.')
            RETURNING id;
        `, [users['JohnDoe']]);

        // 6. Link Questions to Tags
        console.log('Linking questions to tags...');
        await pool.query(`
            INSERT INTO question_tags (question_id, tag_id)
            VALUES 
            ($1, $2), ($1, $3), -- Python Q -> Programming, CS
            ($4, $5),           -- Study spots -> Campus Life
            ($6, $7)            -- Quantum -> Physics
        `, [
            q1.rows[0].id, tags['Programming'], tags['Computer Science'], 
            q2.rows[0].id, tags['Campus Life'], 
            q3.rows[0].id, tags['Physics']
        ]);

        // 7. Create Answers
        console.log('Creating answers...');
        const a1 = await pool.query(`
            INSERT INTO answers (question_id, user_id, body, is_accepted)
            VALUES ($1, $2, 'You should consider using memoization or converting the recursion to an iterative approach using a stack.', true)
            RETURNING id;
        `, [q1.rows[0].id, users['DrProfessor']]);

        const a2 = await pool.query(`
            INSERT INTO answers (question_id, user_id, body)
            VALUES ($1, $2, 'The Science Faculty lounge is usually open 24/7 for students with keycard access.')
            RETURNING id;
        `, [q2.rows[0].id, users['ProfessorX']]);

        // 8. Create Comments
        console.log('Creating comments...');
        await pool.query(`
            INSERT INTO comments (user_id, question_id, body)
            VALUES ($1, $2, 'Great question! I was wondering the same thing.')
        `, [users['JohnDoe'], q2.rows[0].id]);

        await pool.query(`
            INSERT INTO comments (user_id, answer_id, body)
            VALUES ($1, $2, 'Thanks, memoization worked perfectly!')
        `, [users['JohnDoe'], a1.rows[0].id]);

        // 9. Create Ratings
        console.log('Creating ratings...');
        await pool.query(`
            INSERT INTO ratings (question_id, answer_id, rater_user_id, rated_user_id, stars)
            VALUES ($1, $2, $3, $4, 5)
        `, [q1.rows[0].id, a1.rows[0].id, users['JohnDoe'], users['DrProfessor']]);

        // 10. Create Reports
        console.log('Creating reports...');
        await pool.query(`
            INSERT INTO reports (reporter_user_id, question_id, reason)
            VALUES ($1, $2, 'Duplicate of another question')
        `, [users['JaneSmith'], q3.rows[0].id]);

        console.log('Database seeded successfully!');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await pool.end();
    }
}

seed();
