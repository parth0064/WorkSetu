const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title']
    },
    description: {
        type: String,
        required: [true, 'Please add a job description']
    },
    skillRequired: {
        type: String,
        required: [true, 'Please add required skill']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    duration: {
        type: String,
        required: [true, 'Please add estimated duration']
    },
    wage: {
        type: String,
        required: [true, 'Please add wage information']
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['open', 'booked', 'in-progress', 'completed'],
        default: 'open'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'secured', 'released'],
        default: 'pending'
    },
    paymentAmount: {
        type: Number,
        default: 0
    },
    extraExpense: {
        type: Number,
        default: 0
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedWorker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    applicants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    // Set to true once client submits feedback — required before payment release
    feedbackSubmitted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', jobSchema);
