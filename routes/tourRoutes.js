const express = require('express');
const fs = require('fs');
const path = require('path');
const authController = require('./../controllers/authController');
const tourController = require('./../controllers/tourController');

const tourRouter = express.Router();

// ✅ Middleware لتعامل مع أي id في الرابط
tourRouter.param('id', tourController.checkID);

/* ----------------------------- ✅ Public Routes ----------------------------- */

// 👥 متاح للجميع – عرض أرخص 5 جولات
tourRouter
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

// 👥 متاح للجميع – إحصائيات عامة
tourRouter.route('/tour-stats').get(tourController.getTourStats);

// 👥 متاح للجميع – إحصائيات مخصصة
tourRouter.route('/stats-by-country').get(tourController.getStatsPerCountry);
tourRouter.route('/top-revenue-per-visitor').get(tourController.getTopRevenuePerVisitor);

// 👥 متاح للجميع – عرض الجولات حسب الدولة
tourRouter
    .route('/')
    .get(tourController.getToursByCountry);

/* -------------------------- ✅ Protected + Role-Based -------------------------- */

// 🔐 يتطلب تسجيل دخول + أدوار (admin / guide / lead-guide)
tourRouter
    .route('/all')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'guide', 'lead-guide'),
        tourController.getAllTours
    );

// 🔐 إنشاء جولة – فقط لـ admin و lead-guide
tourRouter
    .route('/')
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.checkBody,
        tourController.createTour
    );

// 🔐 تعديل جولة – فقط لـ admin و lead-guide
// 🔐 حذف جولة – فقط لـ admin
// 👥 عرض جولة واحدة متاح للجميع
tourRouter
    .route('/:id')
    .get(tourController.getTourById)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin'),
        tourController.deleteTour
    );

module.exports = tourRouter;