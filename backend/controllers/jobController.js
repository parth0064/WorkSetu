const Job = require('../models/Job');
const Project = require('../models/Project');
const User = require('../models/User');
const WorkHistory = require('../models/WorkHistory');
const JobRequest = require('../models/JobRequest');
const ProjectApplication = require('../models/ProjectApplication');
const Notification = require('../models/Notification');

// @desc    Create new job
// @route   POST /api/jobs/create
// @access  Private (Normal User Only)
exports.createJob = async (req, res, next) => {
    try {
        req.body.postedBy = req.user.id;

        // Map location gracefully — three supported formats from frontend:
        //  1. Pre-built GeoJSON { type:'Point', coordinates:[lng,lat], address } — new GPS path
        //  2. Raw { lat, lng, address }                                          — legacy GPS path
        //  3. Plain string "Mumbai, Maharashtra"                                 — manual fallback
        let locationData = { address: '' };

        const loc = req.body.location;
        if (loc && typeof loc === 'object') {
            if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
                // Case 1: pre-built GeoJSON from new PostJobPage
                locationData = {
                    type: 'Point',
                    coordinates: loc.coordinates, // already [lng, lat]
                    address: loc.address || 'Unknown Address'
                };
            } else if (loc.lat !== undefined && loc.lng !== undefined) {
                // Case 2: legacy { lat, lng } object
                locationData = {
                    type: 'Point',
                    coordinates: [loc.lng, loc.lat],
                    address: loc.address || 'Unknown Address'
                };
            } else if (loc.address) {
                // Case 3a: object with only address (manual via object)
                locationData = { address: loc.address };
            }
        } else if (typeof loc === 'string') {
            // Case 3b: plain string manual fallback — no coordinates stored.
            // These jobs will NOT appear in geo/nearby queries but ARE discoverable
            // in the general Jobs list tab on the worker dashboard.
            locationData = { address: loc };
        }
        
        // Apply transformed location
        const originalLocation = req.body.location;
        req.body.location = locationData;

        const job = await Job.create(req.body);

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get nearby open jobs & projects
// @route   GET /api/jobs/nearby
// @access  Public
exports.getNearbyJobs = async (req, res, next) => {
    try {
        const { lat, lng, radius = 50 } = req.query; // Default 50km radius for discovery

        if (!lat || !lng) {
             return res.status(400).json({ success: false, message: 'Please provide latitude and longitude' });
        }

        const distanceInMeters = radius * 1000;

        // 1. Fetch Jobs
        let jobs = await Job.find({
            status: 'open',
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: distanceInMeters
                }
            }
        }).populate('postedBy', 'name location profileImage');
        
        // 2. Fetch Projects (Long term)
        let projects = await Project.find({ isPublicPost: true, status: 'open' })
            .populate('createdBy', 'name profileImage');

        const transformedProjects = projects.map(p => ({
            _id: p._id,
            title: p.title,
            description: p.description,
            wage: p.wagePerDay,
            location: { address: p.location },
            type: 'project',
            status: p.status,
            postedBy: p.createdBy
        }));

        const transformedJobs = jobs.map(j => ({
            ...j.toObject(),
            type: 'job'
        }));

        const unifiedData = [...transformedJobs, ...transformedProjects];

        res.status(200).json({
             success: true,
             count: unifiedData.length,
             data: unifiedData
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
    try {
        const jobs = await Job.find().populate('postedBy', 'name location');

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get my posted jobs
// @route   GET /api/jobs/my
// @access  Private (Normal User Only)
exports.getMyJobs = async (req, res, next) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).populate('assignedWorker', 'name');

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Apply for job
// @route   POST /api/jobs/apply/:id
// @access  Private (Worker Only)
exports.applyForJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if already applied
        if (job.applicants.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'Already applied' });
        }

        job.applicants.push(req.user.id);
        await job.save();

        // Create Notification for Job Poster
        await Notification.create({
            userId: job.postedBy,
            message: `A worker (${req.user.name}) has applied for your job: ${job.title}`,
            type: 'application',
            relatedId: job._id,
            onModel: 'Job'
        });

        res.status(200).json({
            success: true,
            message: 'Applied successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Book worker for job
// @route   POST /api/jobs/book
// @access  Private (Owner/User Only)
exports.bookWorker = async (req, res, next) => {
    try {
        const { jobId, workerId } = req.body;

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Verify owner
        console.log(`[BOOKING] Job Owner: ${job.postedBy.toString()}, Req User: ${req.user.id}`);
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: `Not authorized. You are ${req.user.id}, owner is ${job.postedBy}` });
        }

        // Check if already booked or beyond
        if (job.status !== 'open') {
             return res.status(400).json({ success: false, message: `Job is already ${job.status}` });
        }

        if (!workerId) {
            return res.status(400).json({ success: false, message: 'workerId is required' });
        }

        // 1. Update Job
        job.assignedWorker = workerId;
        job.status = 'booked';
        await job.save();

        // 2. Update Worker Status to "Busy"
        await User.findByIdAndUpdate(workerId, {
            status: 'busy',
            availability: false
        });

        // 3. Create Notification for Hired Worker
        await Notification.create({
            userId: workerId,
            message: `Congratulations! You have been hired for the job: ${job.title || 'WorkSetu Job'}`,
            type: 'booking',
            relatedId: job._id,
            onModel: 'Job'
        });

        res.status(200).json({
            success: true,
            message: 'Worker booked successfully',
            data: job
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Complete job
// @route   POST /api/jobs/complete
// @access  Private (Owner/User Only)
exports.completeJob = async (req, res, next) => {
    try {
        const { jobId, images, rating, comment } = req.body;

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Verify owner
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (!job.assignedWorker) {
            return res.status(400).json({ success: false, message: 'No worker assigned to this job' });
        }

        // --- NEW VALIDATION ---
        if (job.paymentStatus !== 'secured') {
            return res.status(400).json({ success: false, message: 'Cannot complete job without secured payment' });
        }

        job.status = 'completed';
        job.feedbackSubmitted = true;
        await job.save();

        // Create WorkHistory for worker
        const workHistory = await WorkHistory.create({
            workerId: job.assignedWorker,
            title: job.title,
            description: job.description,
            images: images || [],
            rating,
            comment,
            jobId: job._id,
            wage: job.wage || 0,
            location: job.location || ''
        });

        // Update Worker Stats & Restore Availability
        const worker = await User.findById(job.assignedWorker);
        if (worker) {
            worker.completedJobs += 1;
            worker.status = 'available';
            worker.availability = true;
            // Simple running average
            if (rating) {
                worker.averageRating = ((worker.averageRating * (worker.completedJobs - 1)) + rating) / worker.completedJobs;
            }

            // Badge System Logic
            if (worker.averageRating >= 4.5 && !worker.badges.includes('Top Rated')) {
                worker.badges.push('Top Rated');
            }
            if (worker.completedJobs >= 5 && !worker.badges.includes('Experienced')) {
                worker.badges.push('Experienced');
            }
            if (images && images.length > 0 && !worker.badges.includes('Verified')) {
                worker.badges.push('Verified');
            }

            await worker.save();
        }

        res.status(200).json({
            success: true,
            message: 'Job completed and work history updated',
            data: workHistory
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('assignedWorker', 'name phone skills profileImage averageRating')
            .populate('postedBy', 'name')
            .populate('applicants', 'name profileImage skills status averageRating completedJobs');
        
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({ success: true, data: job });
    } catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get job & project requests (Invites) for worker
// @route   GET /api/jobs/requests
// @access  Private (Worker Only)
exports.getJobRequests = async (req, res, next) => {
    try {
        // 1. Standard Job Requests
        const jobRequests = await JobRequest.find({ 
            workerId: req.user.id,
            status: 'pending'
        }).populate('clientId', 'name phone email');

        // 2. Project Invitations (Contractor requests)
        const projectInvites = await ProjectApplication.find({
            workerId: req.user.id,
            status: 'pending',
            message: 'Direct invite from contractor' // Distinguish from worker applications
        }).populate('projectId', 'title description wagePerDay location duration');

        // Transform Project Invites to match request format
        const unifiedInvites = projectInvites.map(inv => ({
            _id: inv._id,
            jobId: inv.projectId._id,
            title: inv.projectId.title,
            clientId: { name: 'Contractor Invite' },
            type: 'project',
            status: inv.status,
            createdAt: inv.createdAt
        }));

        const unifiedJobRequests = jobRequests.map(req => ({
             ...req.toObject(),
             type: 'job'
        }));

        const finalRequests = [...unifiedJobRequests, ...unifiedInvites];

        res.status(200).json({
            success: true,
            count: finalRequests.length,
            data: finalRequests
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update job request status (Accept/Reject)
// @route   PUT /api/jobs/requests/:id
// @access  Private (Worker Only)
exports.updateJobRequestStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const request = await JobRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Verify worker
        if (request.workerId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        request.status = status;
        await request.save();

        // If accepted, assign worker to the job
        if (status === 'accepted') {
            const job = await Job.findById(request.jobId);
            if (job) {
                job.assignedWorker = req.user.id;
                job.status = 'in-progress';
                await job.save();
            }
        }

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get worker assigned jobs
// @route   GET /api/jobs/my-assigned
// @access  Private (Worker Only)
exports.getMyAssignedJobs = async (req, res, next) => {
    try {
        const jobs = await Job.find({ assignedWorker: req.user.id })
            .populate('postedBy', 'name email phone');
        
        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
