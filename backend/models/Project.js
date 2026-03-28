const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a project title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    requiredSkills: {
        type: [String],
        required: [true, 'Please add required skills']
    },
    location: {
        type: String,
        default: ''
    },
    duration: {
        type: String,
        required: [true, 'Please add estimated duration']
    },
    monthlyDuration: {
        type: String,
        default: ''
    },
    totalWorkers: {
        type: Number,
        default: 1
    },
    workersNeeded: {
        type: Number,
        default: 1
    },
    assignedWorkers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    totalDays: {
        type: Number,
        required: [true, 'Please add total days for tracking']
    },
    completedDays: {
        type: Number,
        default: 0
    },
    wagePerDay: {
        type: Number,
        required: [true, 'Please add wage per day'],
        default: 0
    },
    totalBudget: {
        type: Number,
        default: 0
    },
    isPublicPost: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed'],
        default: 'open'
    },
    constructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema);
