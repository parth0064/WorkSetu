const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: [
            'Masonry', 'Plumbing', 'Electrical', 'Carpentry', 'Painting',
            'Flooring', 'Tiling', 'Welding', 'Roofing', 'Civil Work',
            'Interior Design', 'Landscaping', 'Other'
        ],
        default: 'Other'
    },
    images: {
        type: [String], // Array of Cloudinary URLs
        default: []
    },
    clientName: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    duration: {
        type: String, // e.g. "2 weeks", "3 months"
        default: ''
    },
    completionYear: {
        type: Number,
        min: 1990,
        max: new Date().getFullYear() + 1
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
