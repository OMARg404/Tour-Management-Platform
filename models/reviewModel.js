// models/reviewModel.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty 😅'],
        trim: true,
        minlength: [5, 'Review must be at least 5 characters long']
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        required: [true, 'Rating is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour', // لازم يكون عندك Tour Model
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // لازم يكون عندك User Model
        required: [true, 'Review must belong to a user']
    }
}, {
    // لما نرجع JSON أو Object يتضافوا الـ virtuals
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Populate user & tour info تلقائيًا لما نجيب reviews
reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name email role'
    }).populate({
        path: 'tour',
        select: 'id Location Country Category'
    });
    next();
});

// عشان ما ينفعش نفس اليوزر يعمل أكتر من ريفيو على نفس التور
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;