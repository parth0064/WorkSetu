const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const Transaction = require('./models/Transaction');
    const Project = require('./models/Project');
    
    // Pick the most recently created project
    const project = await Project.findOne({ assignedWorkers: { $exists: true, $ne: [] } }).sort({ createdAt: -1 });
    if (!project) {
        console.log("No assigned projects found to test.");
        process.exit(0);
    }
    
    const txs = await Transaction.find({ relatedTo: project._id });
    console.log("Transactions for project:", project.title);
    txs.forEach(t => {
        console.log(`User: ${t.userId}, Type: ${t.type}, Amount: ${t.amount}, Desc: ${t.description}`);
    });

    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
