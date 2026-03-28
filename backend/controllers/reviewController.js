const Review = require('../models/Review');
const User = require('../models/User');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const Portfolio = require('../models/Portfolio');

// ─── Gamified Rank Assigner ───────────────────────────────────────────────
const calculateRank = (score) => {
    if (score >= 400) return 'Grandmaster 👑';
    if (score >= 251) return 'Master ⚡';
    if (score >= 151) return 'Diamond 💎';
    if (score >= 81)  return 'Platinum 💠';
    if (score >= 41)  return 'Gold 🥇';
    if (score >= 16)  return 'Silver 🥈';
    if (score >= 1)   return 'Bronze 🥉';
    return 'Unranked';
};

// ─── @desc    Submit feedback after job completion ─────────────────────────
// ─── @route   POST /api/reviews ───────────────────────────────────────────
// ─── @access  Private (User / Constructor only) ────────────────────────────
exports.submitFeedback = async (req, res) => {
    try {
        const { jobId, rating, notSatisfied, comment, completedEarly, hypeAwarded } = req.body;

        // ── Validation ──────────────────────────────────────────────────────
        if (!jobId) {
            return res.status(400).json({ success: false, message: 'jobId is required' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Only the job poster can leave feedback
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized. Only the job poster can submit feedback.' });
        }

        // Feedback only after job completion
        if (job.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Feedback can only be submitted after job is marked as completed.' });
        }

        if (!job.assignedWorker) {
            return res.status(400).json({ success: false, message: 'No worker assigned to this job.' });
        }

        // ── Duplicate prevention ─────────────────────────────────────────────
        if (job.feedbackSubmitted) {
            return res.status(400).json({ success: false, message: 'Feedback already submitted for this job.' });
        }

        const existingReview = await Review.findOne({ jobId, reviewerId: req.user.id });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already submitted feedback for this job.' });
        }

        // ── Points calculation ───────────────────────────────────────────────
        let pointsAwarded;
        let finalRating;

        if (notSatisfied === true) {
            pointsAwarded = -1;
            finalRating = 0;
        } else {
            // Validate rating 1–5
            const parsedRating = parseInt(rating, 10);
            if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
                return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5, or mark as Not Satisfied.' });
            }
            // Base points = rating. Bonus points for early completion!
            pointsAwarded = parsedRating + (completedEarly ? 2 : 0);
            finalRating = parsedRating;
        }

        // ── Create Review ────────────────────────────────────────────────────
        const review = await Review.create({
            jobId,
            reviewerId: req.user.id,
            workerId: job.assignedWorker,
            rating: finalRating,
            notSatisfied: notSatisfied === true,
            pointsAwarded,
            completedEarly: completedEarly === true,
            hypeAwarded: hypeAwarded === true,
            comment: comment || ''
        });

        // ── Update Worker Stats ──────────────────────────────────────────────
        const worker = await User.findById(job.assignedWorker);
        if (worker) {
            // -- Beginner-only Hype check: only workers with < 10 portfolio entries can receive Hype
            let effectiveHype = false;
            if (hypeAwarded) {
                const portfolioCount = await Portfolio.countDocuments({ workerId: job.assignedWorker });
                if (portfolioCount < 10) {
                    effectiveHype = true;
                }
            }

            worker.points = (worker.points || 0) + pointsAwarded;
            if (worker.points < -10) worker.points = -10;

            // -- Hype (Beginner-only: enforced above)
            if (effectiveHype) {
                worker.hype = (worker.hype || 0) + 1;
            }

            // -- Rating Average
            if (!notSatisfied) {
                const allRatings = await Review.find({
                    workerId: job.assignedWorker,
                    notSatisfied: false
                });
                const totalRating = allRatings.reduce((acc, r) => acc + r.rating, 0);
                const newAvg = totalRating / allRatings.length;

                worker.rating = {
                    average: parseFloat(newAvg.toFixed(2)),
                    totalReviews: allRatings.length
                };
                worker.averageRating = parseFloat(newAvg.toFixed(2));
            } else {
                if (!worker.rating) worker.rating = { average: 0, totalReviews: 0 };
                worker.rating.totalReviews = (worker.rating.totalReviews || 0) + 1;
            }

            // -- Final Score Formula Calculation
            // Formula: (Experience * 2) + (Hype * 3) + Rating Average
            // Experience = number of completed jobs
            const experience = worker.completedJobs || 0;
            const hypeCount = worker.hype || 0;
            const avgRating = worker.rating?.average || 0;
            
            worker.score = Math.floor((experience * 2) + (hypeCount * 3) + avgRating);

            // -- Determine Gaming Rank Tier
            worker.rank = calculateRank(worker.score);

            worker.markModified('rating');
            await worker.save();
        }

        // ── Mark job as feedback submitted ───────────────────────────────────
        job.feedbackSubmitted = true;
        await job.save();

        // ── Notify the worker ────────────────────────────────────────────────
        const ratingText = notSatisfied
            ? 'marked the work as Not Satisfied ❌'
            : `gave you a ${finalRating}⭐ rating. ${hypeAwarded ? 'They HYPED 🔥 you!' : ''}`;

        await Notification.create({
            userId: job.assignedWorker,
            message: `Your client ${ratingText} for "${job.title}". ${pointsAwarded > 0 ? `+${pointsAwarded} pts earned.` : `${pointsAwarded} pts deducted.`} Rank: ${worker?.rank}`,
            type: 'review',
            relatedId: job._id,
            onModel: 'Job'
        });

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully. You can now release the payment.',
            data: {
                review,
                workerPoints: worker?.points,
                workerScore: worker?.score,
                workerRank: worker?.rank,
                workerHype: worker?.hype
            }
        });

    } catch (error) {
        console.error('Submit Feedback Error:', error);
        // Duplicate key from unique index
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Feedback already submitted for this job.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @desc    Check if feedback exists for a job ───────────────────────────
// ─── @route   GET /api/reviews/job/:jobId ─────────────────────────────────
// ─── @access  Private ──────────────────────────────────────────────────────
exports.getJobFeedback = async (req, res) => {
    try {
        const review = await Review.findOne({ jobId: req.params.jobId })
            .populate('reviewerId', 'name')
            .populate('workerId', 'name');

        res.status(200).json({
            success: true,
            submitted: !!review,
            data: review
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @desc    Get all reviews for a worker ─────────────────────────────────
// ─── @route   GET /api/reviews/:userId ────────────────────────────────────
// ─── @access  Public ───────────────────────────────────────────────────────
exports.getWorkerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ workerId: req.params.userId })
            .populate('reviewerId', 'name profileImage')
            .populate('jobId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Legacy alias (backward compatibility) ────────────────────────────────
exports.createReview = exports.submitFeedback;
exports.getReviewsForUser = exports.getWorkerReviews;
