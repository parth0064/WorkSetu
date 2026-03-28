const mongoose = require('mongoose');

const dailyWorkLogSchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    wage: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['credited', 'pending'],
        default: 'credited'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate daily entries for same worker on same project on same date
dailyWorkLogSchema.index({ workerId: 1, projectId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyWorkLog', dailyWorkLogSchema);
