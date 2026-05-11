const bcrypt = require('bcrypt');
const { writeJSON } = require('./db/index');

async function seed() {
  const hash = await bcrypt.hash('demo123', 10);

  writeJSON('users', [
    { id: 'u_alice', name: 'Alice Mwangi',  email: 'alice@demo.com', passwordHash: hash, subjects: ['Science', 'Math'],       role: 'user', reputation: 45, createdAt: '2026-01-10T08:00:00Z' },
    { id: 'u_bob',   name: 'Bob Kariuki',   email: 'bob@demo.com',   passwordHash: hash, subjects: ['History', 'Language'],   role: 'user', reputation: 30, createdAt: '2026-01-12T09:00:00Z' },
    { id: 'u_carol', name: 'Carol Osei',    email: 'carol@demo.com', passwordHash: hash, subjects: ['Technology', 'Arts'],    role: 'user', reputation: 60, createdAt: '2026-01-15T10:00:00Z' },
  ]);

  console.log('Users seeded.');
  console.log('');
  console.log('Demo accounts (all use password: demo123)');
  console.log('  alice@demo.com');
  console.log('  bob@demo.com');
  console.log('  carol@demo.com');
}

seed().catch(console.error);
