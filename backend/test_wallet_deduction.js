const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const User = require('./models/User');
    const Project = require('./models/Project');
    
    // Pick the most recently created project with assigned workers
    const project = await Project.findOne({ assignedWorkers: { $exists: true, $ne: [] } }).sort({ createdAt: -1 });
    if (!project) {
        console.log("No assigned projects found to test.");
        process.exit(0);
    }
    
    console.log("Found project:", project.title);
    console.log("Contractor ID:", project.createdBy);
    console.log("Worker 1 ID:", project.assignedWorkers[0]);
    
    const contractorBefore = await User.findById(project.createdBy);
    console.log("Contractor balance BEFORE:", contractorBefore.wallet.balance);
    
    const workerBefore = await User.findById(project.assignedWorkers[0]);
    console.log("Worker balance BEFORE:", workerBefore.wallet.balance);
    
    // Manually trigger completeProjectDay logic
    const workersToPay = [project.assignedWorkers[0]];
    const actualPayout = project.wagePerDay * workersToPay.length;
    
    console.log(`Deducting ${actualPayout} from contractor...`);
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        await User.findByIdAndUpdate(project.createdBy, {
            $inc: { 'wallet.balance': -actualPayout }
        }, { session });
        
        await session.commitTransaction();
        console.log("Transaction committed!");
    } catch(err) {
        console.error("Transaction failed:", err);
        await session.abortTransaction();
    } finally {
        session.endSession();
    }
    
    const contractorAfter = await User.findById(project.createdBy);
    console.log("Contractor balance AFTER:", contractorAfter.wallet.balance);

    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
