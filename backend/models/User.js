const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['worker', 'user', 'constructor'],
        default: 'user'
    },
    phone: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    onboardingComplete: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        enum: ['en', 'hi', 'mr'],
        default: 'en'
    },
    status: {
        type: String,
        enum: ['available', 'busy'],
        default: 'available'
    },
    availability: {
        type: Boolean,
        default: true // worker only
    },
    skills: {
        type: [String],
        default: [] // professional skills
    },
    completedJobs: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    // Structured rating object (new)
    rating: {
        average: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    },
    // Points-based reputation system
    points: {
        type: Number,
        default: 0
    },
    hype: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    rank: {
        type: String,
        default: 'Unranked'
    },
    badges: {
        type: [String],
        default: []
    },
    profileImage: {
        type: String,
        default: ''
    },
    wallet: {
        balance: {
            type: Number,
            default: 0
        },
        pending: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
