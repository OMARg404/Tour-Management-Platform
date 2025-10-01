const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

// ✅ Get all reviews
exports.getAllReviews = catchAsync(async(req, res) => {
    const reviews = await Review.find();

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: { reviews }
    });
});

// ✅ Get single review by ID
exports.getReviewById = catchAsync(async(req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return res.status(404).json({
            status: 'fail',
            message: `Review with ID ${req.params.id} not found`
        });
    }

    res.status(200).json({
        status: 'success',
        data: { review }
    });
});

// ✅ Create review
exports.createReview = catchAsync(async(req, res) => {
    // نتأكد إن الـ tour و user جايين من البدي
    if (!req.body.tour || !req.body.user) {
        return res.status(400).json({
            status: 'fail',
            message: 'Review must belong to a tour and a user'
        });
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Review created successfully ✍️⭐',
        data: { review }
    });
});

// ✅ Update review
exports.updateReview = catchAsync(async(req, res) => {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!review) {
        return res.status(404).json({
            status: 'fail',
            message: `Review with ID ${req.params.id} not found`
        });
    }

    res.status(200).json({
        status: 'success',
        message: 'Review updated successfully 🔄',
        data: { review }
    });
});

// ✅ Delete review
exports.deleteReview = catchAsync(async(req, res) => {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
        return res.status(404).json({
            status: 'fail',
            message: `Review with ID ${req.params.id} not found`
        });
    }

    res.status(200).json({
        status: 'success',
        message: 'Review deleted successfully 🗑️',
        data: null
    });
});


exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};