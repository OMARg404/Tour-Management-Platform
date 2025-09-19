const util = require('util')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // مسار الموديل بتاعك
const sendEmail = require('../utils/email');
const crypto = require('crypto');
dotenv.config({ path: './../config.env' });
const JWT_SECRET = process.env.JWT_SECRET; // حطها في .env
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// ✅ إنشاء JWT
const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
// ✅ إرسال الـ JWT للمستخدم + الكوكيز
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // إعدادات الكوكي
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // مدة الصلاحية باليوم
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success👌',
        token,
        data: { user }
    });
};


// ✅ Register
exports.register = async(req, res) => {
    try {
        const newUser = await User.create(req.body);
        createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// ✅ Login
exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password'
            });
        }

        // 2. Find user + select password
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password'
            });
        }

        // 3. Send token
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ✅ Logout (اختياري)
exports.logout = (req, res) => {
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

// ✅ Middleware لحماية الروتس
exports.protect = async(req, res, next) => {
    try {
        // 1. Get token
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ status: 'fail', message: 'You are not logged in!' });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Check if user still exists
        const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
        if (!currentUser) {
            return res.status(401).json({ status: 'fail', message: 'User no longer exists.' });
        }

        // 4. Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({
                status: 'fail',
                message: 'User recently changed password. Please log in again.'
            });
        }

        // ✅ Allow access
        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({ status: 'fail', message: 'Invalid token or user' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

exports.forgotPassword = async(req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res
                .status(404)
                .json({ status: 'fail', message: 'No user with that email' });
        }

        // 1) Generate the reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // 2) Create reset URL
        const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

        // 3) Send it via email
        const message = `You requested a password reset.\nPlease make a PATCH request with your new password to:\n${resetURL}\n\nIf you didn't request this, please ignore this email.`;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset (valid for 10 min)',
            message,
            html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    
    <!-- Logo / Header -->
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://via.placeholder.com/120x40?text=GlobeTrackr" alt="GlobeTrackr Logo" style="max-width: 120px; margin-bottom: 10px;" />
      <h1 style="color: #4CAF50; font-size: 20px; margin: 0;">GlobeTrackr</h1>
    </div>

    <h2 style="color: #4CAF50;">Hello ${user.name || 'User'} 👋</h2>
    <p style="font-size: 16px;">You requested a password reset for your <strong>GlobeTrackr</strong> account.</p>
    <p style="font-size: 16px;">Click the button below to reset your password:</p>
    
    <a href="${resetURL}" target="_blank" 
       style="display: inline-block; padding: 12px 20px; margin: 20px 0; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 6px;">
       🔑 Reset Password
    </a>
    
    <p style="font-size: 14px; color: #777;">
      If you didn't request this, you can safely ignore this email.
    </p>
    
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
    <p style="font-size: 12px; color: #aaa; text-align: center;">
      © ${new Date().getFullYear()} GlobeTrackr. All rights reserved.
    </p>
  </div>
`

        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent successfully to your email',
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
exports.resetPassword = async(req, res) => {
    try {

        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ status: 'fail', message: 'Token is invalid or expired' });
        }
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};


// ✅ Update Password (للمستخدم اللي عامل لوج إن بالفعل)
exports.updatePassword = async(req, res) => {
    try {

        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }


        if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Your current password is wrong'
            });
        }


        user.password = req.body.newPassword;
        user.confirmPassword = req.body.confirmPassword;
        await user.save();


        createSendToken(user, 200, res);

    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};