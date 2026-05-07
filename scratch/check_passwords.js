import bcrypt from 'bcrypt';

async function check() {
    const passwords = ['admin123', 'student123', 'lecturer123'];
    const hashes = {
        admin: '$2b$10$7rX.fE3i1I3qY.k.k.k.k.', // This is just a placeholder
    };
    
    // Actually, I can just fetch the hashes from the DB and check them
}
