const Portfolio = require('../models/Portfolio');
const User = require('../models/User');

// ─── Compute experience level from past work count ────────────────────────
const getExperienceLevel = (count) => {
    if (count < 10) return 'Beginner';
    if (count < 25) return 'Intermediate';
    return 'Pro';
};

// ─── @desc    Add a new portfolio entry ───────────────────────────────────
// ─── @route   POST /api/portfolio ────────────────────────────────────────
// ─── @access  Private (worker only) ──────────────────────────────────────
exports.addPortfolioEntry = async (req, res) => {
    try {
        const { title, description, category, clientName, location, duration, completionYear } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        // Collect uploaded image URLs from multer-cloudinary
        const images = req.files ? req.files.map(f => f.path) : [];

        const entry = await Portfolio.create({
            workerId: req.user.id,
            title,
            description: description || '',
            category: category || 'Other',
            images,
            clientName: clientName || '',
            location: location || '',
            duration: duration || '',
            completionYear: completionYear ? parseInt(completionYear) : new Date().getFullYear()
        });

        // Compute experience level for the response
        const count = await Portfolio.countDocuments({ workerId: req.user.id });
        const experienceLevel = getExperienceLevel(count);

        res.status(201).json({
            success: true,
            message: 'Portfolio entry added!',
            data: entry,
            experienceLevel,
            totalEntries: count
        });
    } catch (error) {
        console.error('Add Portfolio Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @desc    Get my portfolio entries ────────────────────────────────────
// ─── @route   GET /api/portfolio/me ──────────────────────────────────────
// ─── @access  Private ────────────────────────────────────────────────────
exports.getMyPortfolio = async (req, res) => {
    try {
        const entries = await Portfolio.find({ workerId: req.user.id })
            .sort({ completionYear: -1, createdAt: -1 });

        const experienceLevel = getExperienceLevel(entries.length);

        res.status(200).json({
            success: true,
            count: entries.length,
            experienceLevel,
            data: entries
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @desc    Get any worker's portfolio (public) ─────────────────────────
// ─── @route   GET /api/portfolio/:userId ─────────────────────────────────
// ─── @access  Public ──────────────────────────────────────────────────────
exports.getWorkerPortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        const entries = await Portfolio.find({ workerId: req.params.userId, isVisible: true })
            .sort({ completionYear: -1, createdAt: -1 });

        const experienceLevel = getExperienceLevel(entries.length);

        res.status(200).json({
            success: true,
            count: entries.length,
            experienceLevel,
            isBeginnerEligible: entries.length < 10, // for Hype button in frontend
            data: entries,
            worker: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @desc    Update a portfolio entry ────────────────────────────────────
// ─── @route   PUT /api/portfolio/:id ─────────────────────────────────────
// ─── @access  Private (owner only) ───────────────────────────────────────
exports.updatePortfolioEntry = async (req, res) => {
    try {
        const entry = await Portfolio.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }
        if (entry.workerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const { title, description, category, clientName, location, duration, completionYear, isVisible } = req.body;
        const updated = await Portfolio.findByIdAndUpdate(
            req.params.id,
            { title, description, category, clientName, location, duration, completionYear, isVisible },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @desc    Delete a portfolio entry ────────────────────────────────────
// ─── @route   DELETE /api/portfolio/:id ──────────────────────────────────
// ─── @access  Private (owner only) ───────────────────────────────────────
exports.deletePortfolioEntry = async (req, res) => {
    try {
        const entry = await Portfolio.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }
        if (entry.workerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await entry.deleteOne();
        res.status(200).json({ success: true, message: 'Entry deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
