const mongoose = require('mongoose');

const workHistorySchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    images: {
        type: [String], // Array of Cloudinary URLs
        default: []
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    comment: {
        type: String
    },
    wage: {
        type: Number,
        default: 0
    },
    location: {
        type: String,
        default: ''
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WorkHistory', workHistorySchema);
