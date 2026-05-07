import bcrypt from 'bcrypt';

const testPasswords = [
    { email: 'admin@campusq.com', password: 'admin123', hash: '$2b$10$m4eVEQyj4KC9OeeJ4rxwoOzfVMTTBSXpZ9KA/m1u1aL5LaYBGN4Da' },
    { email: 'student1@campusq.com', password: 'student123', hash: '$2b$10$PW4o8DfM2PFo2l4ij9bpWucabVfaTyMa6OSQY6qebThRwM6Vp2y2W' },
    { email: 'lecturer1@campusq.com', password: 'lecturer123', hash: '$2b$10$rY.wQ73KEl0WNWd8BPsmjuG.ol6XZSmmSgjKQRKRww0YQ8B6MuRs.' }
];

async function verify() {
    for (const test of testPasswords) {
        const match = await bcrypt.compare(test.password, test.hash);
        console.log(`Email: ${test.email}, Password: ${test.password}, Match: ${match}`);
    }
}

verify();
