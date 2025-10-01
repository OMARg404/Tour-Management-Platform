const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router();

// ✅ لازم المستخدم يكون مسجل دخول عشان يعمل review
router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user', 'admin'), // بس المستخدم العادي يعمل review
        reviewController.setTourUserIds, // middleware يربط الـ review بالـ tour و user
        reviewController.createReview
    );

router
    .route('/:id')
    .get(reviewController.getReviewById)
    .patch(
        authController.restrictTo('user', 'admin'),
        reviewController.updateReview
    )
    .delete(
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview
    );

module.exports = router;