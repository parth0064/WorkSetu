const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // rating: 1-5 for satisfied, 0 for "Not Satisfied"
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    notSatisfied: {
        type: Boolean,
        default: false
    },
    // Points awarded/deducted for this review
    pointsAwarded: {
        type: Number,
        default: 0
    },
    completedEarly: {
        type: Boolean,
        default: false
    },
    hypeAwarded: {
        type: Boolean,
        default: false
    },
    comment: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// One review per job (enforce unique constraint)
reviewSchema.index({ jobId: 1, reviewerId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
