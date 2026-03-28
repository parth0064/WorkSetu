const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testUsers = [
    {
        name: 'Test Worker',
        email: 'testworker@worksetu.com',
        password: 'test1234',
        role: 'worker',
        phone: '9000000001',
        location: 'Mumbai',
        skills: ['Mason', 'Tiling'],
        completedJobs: 12,
        averageRating: 4.5,
        badges: ['Verified'],
        onboardingComplete: true
    },
    {
        name: 'Test Client',
        email: 'testclient@worksetu.com',
        password: 'test1234',
        role: 'user',
        phone: '9000000002',
        location: 'Pune',
        onboardingComplete: true
    }
];

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB...');

        for (const userData of testUsers) {
            // Remove old test user if exists (to allow re-run)
            await User.deleteOne({ email: userData.email });
            const user = await User.create(userData);
            console.log(`✅ Created: ${user.name} | ${user.email} | Role: ${user.role}`);
        }

        console.log('\n🎉 Test users ready:');
        console.log('─────────────────────────────────────────');
        console.log('  Worker  → testworker@worksetu.com / test1234');
        console.log('  Client  → testclient@worksetu.com / test1234');
        console.log('─────────────────────────────────────────');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

run();
