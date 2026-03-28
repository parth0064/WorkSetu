const User = require('../models/User');
const jwt = require('jsonwebtoken');


// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, phone, location } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            phone,
            location,
            onboardingComplete: true
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

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

// @desc    Complete onboarding for Google users
// @route   PUT /api/auth/complete-onboarding
// @access  Private
exports.completeOnboarding = async (req, res, next) => {
    try {
        const { role, password, language, phone, location } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update role
        if (role && ['worker', 'user', 'constructor'].includes(role)) {
            user.role = role;
        }

        // Set password for future email/password login
        if (password && password.length >= 6) {
            user.password = password;
        }

        // Set language preference
        if (language && ['en', 'hi', 'mr'].includes(language)) {
            user.language = language;
        }

        // Set phone & location
        if (phone) user.phone = phone;
        if (location) user.location = location;

        // Mark onboarding as complete
        user.onboardingComplete = true;

        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, isNewUser = false) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        isNewUser,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            onboardingComplete: user.onboardingComplete,
            language: user.language,
            phone: user.phone || '',
            location: user.location || '',
            skills: user.skills || [],
            badges: user.badges || [],
            profileImage: user.profileImage || '',
            averageRating: user.averageRating || 0,
            rating: user.rating || { average: 0, totalReviews: 0 },
            points: user.points || 0,
            hype: user.hype || 0,
            score: user.score || 0,
            rank: user.rank || 'Unranked',
            completedJobs: user.completedJobs || 0,
            availability: user.availability ?? true,
            status: user.status || 'available',
            wallet: user.wallet || { balance: 0, pending: 0 }
        }
    });
};
