const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const Project = require('./models/Project');
    const User = require('./models/User');

    const contractor = await User.findOne({ role: 'contractor' });
    if (!contractor) {
        console.log("No contractor found.");
        process.exit();
    }

    try {
        const project = await Project.create({
            title: "Test Project",
            description: "Bug hunting",
            requiredSkills: ["Mason"],
            location: "Test Location",
            duration: "3 Months",
            totalWorkers: 1,
            totalDays: 30,
            wagePerDay: 500,
            createdBy: contractor._id,
            isPublicPost: true
        });
        console.log("Project created successfully!", project._id);
    } catch(err) {
        console.error("Error creating project:", err);
    }
    process.exit();
  })
  .catch(console.error);
