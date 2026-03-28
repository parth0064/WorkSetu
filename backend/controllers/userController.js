const User = require('../models/User');
const WorkHistory = require('../models/WorkHistory');
const Portfolio = require('../models/Portfolio');

// Helper to compute experience level from portfolio count
const getExperienceLevel = (count) => {
    if (count < 10) return 'Beginner';
    if (count < 25) return 'Intermediate';
    return 'Pro';
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin or Internal)
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all workers
// @route   GET /api/users/workers
// @access  Public
exports.getWorkers = async (req, res, next) => {
    try {
        const workers = await User.find({ role: 'worker' });

        res.status(200).json({
            success: true,
            count: workers.length,
            data: workers
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single user profiling including work history + portfolio
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const workHistory = await WorkHistory.find({ workerId: req.params.id });
        const portfolio = await Portfolio.find({ workerId: req.params.id, isVisible: true })
            .sort({ completionYear: -1, createdAt: -1 });

        const experienceLevel = getExperienceLevel(portfolio.length);
        const isBeginnerEligible = portfolio.length < 10;

        res.status(200).json({
            success: true,
            data: {
                user,
                workHistory,
                portfolio,
                experienceLevel,
                isBeginnerEligible
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update worker availability and profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            phone: req.body.phone,
            location: req.body.location,
            availability: req.body.availability,
            skills: req.body.skills,
            profileImage: req.body.profileImage
        };
        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Upload profile photo
// @route   POST /api/users/profile-photo
// @access  Private
exports.uploadProfilePhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Save the Cloudinary URL to user profile
        user.profileImage = req.file.path; // Cloudinary URL
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully',
            data: user.profileImage
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
