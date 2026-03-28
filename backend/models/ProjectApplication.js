const mongoose = require('mongoose');

const projectApplicationSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        default: ''
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate applications from same worker to same project
projectApplicationSchema.index({ projectId: 1, workerId: 1 }, { unique: true });

module.exports = mongoose.model('ProjectApplication', projectApplicationSchema);
