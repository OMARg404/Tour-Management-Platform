const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require('validator');
const { type } = require('os');

// 👇 خلي دول في .env في مشروع حقيقي
const ENCRYPTION_KEY = crypto.randomBytes(32); // 32 chars = 256 bits
const IV = crypto.randomBytes(16); // 16 chars = 128 bits

// ✅ دالة التشفير
function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${encrypted}:${IV.toString('hex')}`;
}

// ✅ دالة فك التشفير (لو احتجت تستخدمها مستقبلاً)
function decrypt(encryptedData) {
    const [encrypted, ivHex] = encryptedData.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// 🧩 User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: {
        type: Number,
        min: [0, 'Age must be positive'],
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    national_id: {
        type: String,
        unique: true,
        sparse: true
    },
    birth_date: {
        type: Date
    },
    nationality: String,
    marital_status: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed']
    },
    blood_type: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    emergency_contact: {
        name: String,
        relation: String,
        phone: String
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
    is_active: {
        type: Boolean,
        default: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    address: {
        street: String,
        city: String,
        country: String,
    },
    phone: String,
    occupation: String,
    hobbies: [String],
    skills: {
        programming_languages: [String],
        frameworks: [String],
    },
    social_media: {
        linkedin: String,
        github: String,
    },
    is_student: { type: Boolean, default: false },
    graduation_year: Number,
    courses: [{
        course_name: String,
        institution: String,
    }],
    profile_image: {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    confirmPassword: {
        type: String,
        required: true,
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords do not match!'
        }
    },
    creditCard: {
        cardNumber: {
            type: String,
            required: true,
            select: false
        },
        cardHolder: {
            type: String,
            required: true
        },
        expiryDate: {
            type: String,
            required: true
        },
        cvv: {
            type: String,
            required: true,
            select: false
        }
    },
    passwordChangedAt: Date, // ✅ متى تم تغيير الباسورد آخر مرة
    passwordResetToken: String, // 🔐 توكن إعادة تعيين كلمة المرور (مشفر)
    passwordResetExpires: Date
}, {
    timestamps: true
});


// 🔐 تشفير الباسورد + بيانات الفيزا
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.confirmPassword = undefined;
        this.passwordChangedAt = Date.now() - 1000; // ✅ جديد - نطرح ثانية لحل مشكلة توقيت إصدار التوكن
    }

    if (this.isModified('creditCard.cardNumber')) {
        this.creditCard.cardNumber = encrypt(this.creditCard.cardNumber);
    }

    if (this.isModified('creditCard.cvv')) {
        this.creditCard.cvv = encrypt(this.creditCard.cvv);
    }

    next();
});

// ✅ التحقق من كلمة السر
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// ✅ هل المستخدم غيّر الباسورد بعد إصدار التوكن؟
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


const User = mongoose.model('User', userSchema);
module.exports = User;