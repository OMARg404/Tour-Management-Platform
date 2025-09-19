// 📂 routes/userRoutes.js
const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const userRouter = express.Router();

/* -------------------- ✅ Public Auth Routes -------------------- */

// 📨 نسيان الباسورد (يرسل توكن)
userRouter.post('/forgotPassword', authController.forgotPassword);

// 🔐 إعادة تعيين الباسورد باستخدام التوكن
userRouter.patch('/resetPassword/:token', authController.resetPassword);

// 🔑 تسجيل مستخدم جديد
userRouter.post('/register', authController.register);

// 🔐 تسجيل دخول
userRouter.post('/login', authController.login);

// 🔓 تسجيل خروج
userRouter.post('/logout', authController.logout);

/* -------------------- ✅ Middleware: الحماية -------------------- */
userRouter.use(authController.protect);

/* -------------------- ✅ Routes خاصة بالمستخدم -------------------- */

// 🔑 تحديث الباسورد (للمستخدم اللي عامل Login)
userRouter.patch('/updateMyPassword', authController.updatePassword);

// 🧑‍💻 تحديث بياناتي الشخصية
userRouter.patch('/updateMe', userController.updateMe);

// 🗑️ حذف (تعطيل) الحساب الخاص بي
userRouter.delete('/deleteMe', userController.deleteMe);

/* -------------------- ✅ ID Param Middleware -------------------- */
userRouter.param('id', userController.checkID);

/* -------------------- ✅ Protected Routes -------------------- */

// 🧾 عرض كل المستخدمين أو إنشاء واحد جديد
// ملاحظة: إنشاء مستخدم غالبًا يكون فقط من قبل admin
userRouter
    .route('/')
    .get(
        authController.restrictTo('admin'),
        userController.getAllUsers
    )
    .post(
        authController.restrictTo('admin'),
        userController.createUser
    );

// 🧑‍💻 عرض أو تعديل أو حذف مستخدم محدد (للأدمن فقط)
userRouter
    .route('/:id')
    .get(userController.getUserById)
    .patch(authController.restrictTo('admin'), userController.updateUser)
    .delete(authController.restrictTo('admin'), userController.deleteUser);

module.exports = userRouter;