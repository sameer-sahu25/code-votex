const bcrypt = require('bcryptjs');
const { User, Agent } = require('../models');
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  try {
    console.log('Seeding database...');

    // Create admin user
    const admin = await User.create({
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      role: 'admin',
    });
    console.log('Admin user created');

    // Create test agent
    const agent = await Agent.create({
      userId: admin.id,
      agentKey: uuidv4(),
      hostname: 'test-agent',
      osType: 'linux',
    });
    console.log('Test agent created');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
