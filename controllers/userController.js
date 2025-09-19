const User = require('../models/userModel');

// ✅ Middleware to check if the user exists and attach it to req.user
exports.checkID = async(req, res, next, id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            console.log(`User with id ${id} not found 🙄`);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(`User ID is: 🌟 ${id}`);
        req.user = user;
        next();
    } catch (err) {
        return res.status(400).json({ status: 'fail', message: 'Invalid ID' });
    }
};

// ✅ Get All Users
exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ status: 'success', results: users.length, data: { users } });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ✅ Get User by ID
exports.getUserById = async(req, res) => {
    res.status(200).json({ status: 'success', data: { user: req.user } });
};

// ✅ Create User (For Admin usage)
exports.createUser = async(req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({ status: 'success', data: { user } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// ✅ Update User
exports.updateUser = async(req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ status: 'success', data: { user: updatedUser } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// ✅ Delete User
exports.deleteUser = async(req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(204).send(); // No Content
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
exports.updateMe = async(req, res) => {
    try {
        // 1) منع تحديث الحقول الحساسة
        if (req.body.password || req.body.confirmPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'This route is not for password updates. Please use /updateMyPassword.'
            });
        }

        // 2) السماح فقط بالحقول اللي ممكن تتعدل من اليوزر
        const allowedFields = [
            'name',
            'age',
            'gender',
            'national_id',
            'birth_date',
            'nationality',
            'marital_status',
            'blood_type',
            'emergency_contact',
            'email',
            'address',
            'phone',
            'occupation',
            'hobbies',
            'skills',
            'social_media',
            'is_student',
            'graduation_year',
            'courses',
            'profile_image',
        ];

        // ✅ لو فيه أي مفتاح مش مسموح → نرفض الريكوست
        const invalidFields = Object.keys(req.body).filter(
            (el) => !allowedFields.includes(el)
        );
        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 'fail',
                message: `Invalid field(s): ${invalidFields.join(', ')}`
            });
        }

        // 3) تحديث بيانات المستخدم
        const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// controller/userController.js
// 🗑️ حذف (تعطيل) الحساب الخاص باليوزر
// 🗑️ Delete user permanently
exports.deleteMe = async(req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        // رجع بيانات اليوزر اللي اتمسح
        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully',
            deletedUser: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};