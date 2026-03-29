const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Job = require('./models/Job');

const fixStuckJobs = async () => {
    try {
        await connectDB();
        const res = await Job.updateMany(
            { 
                status: 'completed', 
                paymentStatus: 'secured',
                $or: [
                    { feedbackSubmitted: false },
                    { feedbackSubmitted: { $exists: false } }
                ]
            }, 
            { $set: { feedbackSubmitted: true } }
        );
        console.log('Fixed stuck jobs:', res.modifiedCount);
        process.exit(0);
    } catch (error) {
        console.error('Error fixing jobs:', error);
        process.exit(1);
    }
};

fixStuckJobs();
