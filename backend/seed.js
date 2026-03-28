const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Project = require('./models/Project');
const WorkHistory = require('./models/WorkHistory');
const Review = require('./models/Review');
const JobRequest = require('./models/JobRequest');

dotenv.config();

const users = [
    {
        name: 'Suresh Raina',
        email: 'suresh@worker.com',
        password: 'password123',
        role: 'worker',
        phone: '9876543210',
        location: 'Mumbai',
        skills: ['Mason', 'Plastering'],
        completedJobs: 156,
        averageRating: 4.8,
        badges: ['Top Rated', 'Verified']
    },
    {
        name: 'Pawan Kalyan',
        email: 'pawan@worker.com',
        password: 'password123',
        role: 'worker',
        phone: '9876543211',
        location: 'Hyderabad',
        skills: ['Tile Worker', 'Flooring'],
        completedJobs: 92,
        averageRating: 4.6,
        badges: ['Reliable']
    },
    {
        name: 'Amitabh B.',
        email: 'amitabh@worker.com',
        password: 'password123',
        role: 'worker',
        phone: '9876543212',
        location: 'Mumbai',
        skills: ['Plumber', 'Pipe Fitting'],
        completedJobs: 210,
        averageRating: 4.9,
        badges: ['Top Rated']
    },
    {
        name: 'Virat Kohli',
        email: 'virat@worker.com',
        password: 'password123',
        role: 'worker',
        phone: '9876543213',
        location: 'Delhi',
        skills: ['Painter', 'Wall Decor'],
        completedJobs: 45,
        averageRating: 4.7,
        badges: ['Rising Star']
    },
    {
        name: 'Rohit Sharma',
        email: 'rohit@worker.com',
        password: 'password123',
        role: 'worker',
        phone: '9876543214',
        location: 'Mumbai',
        skills: ['Electrician', 'Wiring'],
        completedJobs: 120,
        averageRating: 4.8,
        badges: ['Verified']
    },
    {
        name: 'Amit Sharma', // Homeowner
        email: 'amit@user.com',
        password: 'password123',
        role: 'user',
        phone: '9876543215',
        location: 'Pune'
    },
    {
        name: 'Rajesh Gupta', // Constructor
        email: 'rajesh@constructor.com',
        password: 'password123',
        role: 'constructor',
        phone: '9876543216',
        location: 'Bangalore'
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas...');

        // Clear existing data
        await User.deleteMany();
        await Job.deleteMany();
        await Project.deleteMany();
        await WorkHistory.deleteMany();
        await Review.deleteMany();
        await JobRequest.deleteMany();
        console.log('Data Cleared...');

        // Create Users
        const createdUsers = await User.create(users);
        console.log(`${createdUsers.length} Users Created...`);

        const homeowner = createdUsers.find(u => u.role === 'user');
        const homeowners = createdUsers.filter(u => u.role === 'user');
        const constructor = createdUsers.find(u => u.role === 'constructor');
        const worker = createdUsers.find(u => u.role === 'worker');

        // Create Sample Job
        const job = await Job.create({
            title: 'House Painting',
            description: 'Need interior painting for a 3BHK flat.',
            skillRequired: 'Painter',
            location: 'Pune',
            duration: '5 days',
            wage: '15000',
            postedBy: homeowner._id,
            status: 'open'
        });

        // Create Sample Project
        await Project.create({
            title: 'Green Valley Apartments',
            description: 'Multi-story residential complex construction.',
            requiredSkills: ['Mason', 'Plumber', 'Electrician'],
            location: 'Bangalore',
            duration: '6 months',
            workersNeeded: 20,
            totalDays: 180,
            constructor: constructor._id,
            status: 'in-progress'
        });

        // Create Sample Work History for सुरेश (Suresh)
        const suresh = createdUsers.find(u => u.email === 'suresh@worker.com');
        if (suresh) {
            await WorkHistory.create([
                {
                    workerId: suresh._id,
                    title: "Villa Renovation",
                    description: "Complete interior renovation of a luxury villa.",
                    wage: 4500,
                    location: "Bandra, Mumbai",
                    rating: 4.9
                },
                {
                    workerId: suresh._id,
                    title: "Office Tiling",
                    description: "Fixing premium tiles in a 2000sqft office space.",
                    wage: 3200,
                    location: "Andheri, Mumbai",
                    rating: 5.0
                }
            ]);
        }

        // Create Sample Job Requests (Invitations)
        if (worker && homeowners.length > 0) {
            const hOwner = homeowners[0];
            await JobRequest.create([
                {
                    jobId: job._id,
                    workerId: worker._id,
                    clientId: hOwner._id,
                    title: "Bathroom Tiling",
                    location: "Andheri East",
                    wage: 1500,
                    status: 'pending'
                },
                {
                    jobId: job._id,
                    workerId: worker._id,
                    clientId: hOwner._id,
                    title: "Wall Painting",
                    location: "Powai",
                    wage: 2200,
                    status: 'pending'
                }
            ]);
        }

        console.log('Seed data successfully added!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
