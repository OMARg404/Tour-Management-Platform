const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        // required: [true, 'ID is required'],
        min: [1, 'ID must be greater than 0'],
        validate: {
            validator: Number.isInteger,
            message: 'ID must be an integer'
        }
    },
    Location: {
        type: String,
        required: [true, 'Location is required'],
        minlength: [3, 'Location must have at least 3 characters'],
        maxlength: [50, 'Location must not exceed 50 characters'],
        match: [/^[a-zA-Z\s\-]+$/, 'Location must contain only letters, spaces, or hyphens']
    },
    Country: {
        type: String,
        required: [true, 'Country is required'],
        minlength: [2, 'Country must have at least 2 characters'],
        maxlength: [50, 'Country must not exceed 50 characters'],
        match: [/^[a-zA-Z\s\-]+$/, 'Country must contain only letters, spaces, or hyphens']
    },
    Category: {
        type: String,
        required: [true, 'Category is required'],
        minlength: [3, 'Category must have at least 3 characters'],
        maxlength: [50, 'Category must not exceed 50 characters'],
        match: [/^[a-zA-Z\s\-]+$/, 'Category must contain only letters, spaces, or hyphens']
    },
    Visitors: {
        type: Number,
        required: [true, 'Number of visitors is required'],
        min: [0, 'Visitors must be >= 0'],
        max: [100000000, 'Too many visitors!']
    },
    Rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot exceed 5'],
        validate: {
            validator: val => /^\d+(\.\d{1,2})?$/.test(val.toString()),
            message: 'Rating must have max 2 decimal places'
        }
    },
    Revenue: {
        type: Number,
        required: [true, 'Revenue is required'],
        min: [0, 'Revenue must be a positive number']
    },
    Accommodation_Available: {
        type: String,
        enum: {
            values: ['Yes', 'No'],
            message: 'Accommodation_Available must be either "Yes" or "No"'
        },
        required: [true, 'Accommodation availability is required']
    },
    slug: {
        type: String
    },
    createdAtCustom: {
        type: String
    },

    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point'] // GeoJSON لازم يكون Point
        },
        coordinates: {
            type: [Number],
            required: [true, 'Coordinates are required'], // [longitude, latitude]
            validate: {
                validator: function(val) {
                    return val.length === 2;
                },
                message: 'Coordinates must be an array of [longitude, latitude]'
            }
        },
        description: {
            type: String,
            maxlength: [100, 'Description must not exceed 100 characters']
        },
        address: {
            type: String,
            maxlength: [200, 'Address must not exceed 200 characters']
        }
    },
    startDate: {
        type: Date,
        required: [true, 'A tour must have a start date']
    },
    timestamp: {
        type: Date,
        default: Date.now // ⏰ وقت تسجيل الرحلة في النظام
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ✅ Add geospatial index
tourSchema.index({ startLocation: '2dsphere' });

// ✅ Virtuals
tourSchema.virtual('isPopular').get(function() {
    return this.Visitors >= 500000;
});

tourSchema.virtual('revenuePerVisitor').get(function() {
    if (!this.Visitors || this.Visitors === 0) return 0;
    return (this.Revenue / this.Visitors).toFixed(2);
});

// ✅ Document Middleware - pre save
tourSchema.pre('save', function(next) {
    if (this.Location && typeof this.Location === 'string') {
        this.Location = this.Location.charAt(0).toUpperCase() + this.Location.slice(1);
    }

    if (this.Location && this.Country) {
        this.slug = slugify(`${this.Location}-${this.Country}`, { lower: true });
    }

    if (!this.createdAtCustom) {
        this.createdAtCustom = new Date().toISOString();
    }

    next();
});

// ✅ Query Middleware - optional filter + timer
tourSchema.pre(/^find/, function(next) {
    if (this.getOptions().highRatedOnly) {
        this.where({ Rating: { $gte: 3 } });
    }

    this._queryStart = Date.now();
    next();
});

tourSchema.post(/^find/, function(docs, next) {
    const duration = Date.now() - this._queryStart;
    console.log(`Query took ${duration}ms and returned ${docs.length || 1} documents.`);
    next();
});

// ✅ Update Middleware - auto slug, format, etc.
function setDerivedFields(next) {
    const update = this.getUpdate() || {};
    const doc = update.$set ? update.$set : update;

    if (doc.Location && typeof doc.Location === 'string') {
        doc.Location = doc.Location.charAt(0).toUpperCase() + doc.Location.slice(1);
    }

    if (doc.Location && doc.Country) {
        doc.slug = slugify(`${doc.Location}-${doc.Country}`, { lower: true });
    }

    if (!doc.createdAtCustom) {
        doc.createdAtCustom = new Date().toISOString();
    }

    if (update.$set) {
        update.$set = doc;
    } else {
        this.setUpdate(doc);
    }

    next();
}

tourSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], setDerivedFields);

// ✅ Static Aggregation Methods
tourSchema.statics.getStatsByCountry = function() {
    return this.aggregate([{
            $group: {
                _id: '$Country',
                totalVisitors: { $sum: '$Visitors' },
                totalRevenue: { $sum: '$Revenue' },
                averageRating: { $avg: '$Rating' },
                tourCount: { $sum: 1 }
            }
        },
        { $sort: { totalRevenue: -1 } }
    ]);
};

tourSchema.statics.getToursPerCategory = function() {
    return this.aggregate([{
            $group: {
                _id: '$Category',
                totalTours: { $sum: 1 }
            }
        },
        { $sort: { totalTours: -1 } }
    ]);
};

tourSchema.statics.getTopRevenuePerVisitor = function() {
    return this.aggregate([{
            $project: {
                Location: 1,
                Country: 1,
                revenuePerVisitor: {
                    $cond: [
                        { $eq: ['$Visitors', 0] },
                        0,
                        { $round: [{ $divide: ['$Revenue', '$Visitors'] }, 2] }
                    ]
                }
            }
        },
        { $sort: { revenuePerVisitor: -1 } },
        { $limit: 5 }
    ]);
};

tourSchema.statics.getLowRatedNoAccommodation = function() {
    return this.aggregate([{
            $match: {
                Rating: { $lt: 3 },
                Accommodation_Available: 'No'
            }
        },
        {
            $project: {
                id: 1,
                Location: 1,
                Country: 1,
                Rating: 1,
                Accommodation_Available: 1
            }
        }
    ]);
};

tourSchema.statics.getStatsByAccommodation = function() {
    return this.aggregate([{
        $group: {
            _id: '$Accommodation_Available',
            avgRating: { $avg: '$Rating' },
            avgRevenue: { $avg: '$Revenue' },
            count: { $sum: 1 }
        }
    }]);
};

tourSchema.statics.getTopRatedCountries = function() {
    return this.aggregate([
        { $match: { Rating: { $gt: 4.5 } } },
        {
            $group: {
                _id: '$Country',
                highRatedTours: { $sum: 1 }
            }
        },
        { $sort: { highRatedTours: -1 } },
        { $limit: 3 }
    ]);
};

tourSchema.statics.getTopRevenuePerVisitor = async function() {
    return this.aggregate([{
            $addFields: {
                revenuePerVisitor: {
                    $cond: [
                        { $gt: ['$Visitors', 0] },
                        { $divide: ['$Revenue', '$Visitors'] },
                        0
                    ]
                }
            }
        },
        { $sort: { revenuePerVisitor: -1 } },
        { $limit: 5 },
        {
            $project: {
                _id: 0,
                Country: 1,
                Location: 1,
                revenuePerVisitor: { $round: ['$revenuePerVisitor', 2] }
            }
        }
    ]);
};
tourSchema.statics.getStatsByCountry = async function() {
    return this.aggregate([{
            $group: {
                _id: '$Country',
                totalTours: { $sum: 1 },
                totalVisitors: { $sum: '$Visitors' },
                avgRevenue: { $avg: '$Revenue' },
                avgRating: { $avg: '$Rating' }
            }
        },
        {
            $project: {
                _id: 0,
                Country: '$_id',
                totalTours: 1,
                totalVisitors: 1,
                avgRevenue: { $round: ['$avgRevenue', 2] },
                avgRating: { $round: ['$avgRating', 2] }
            }
        },
        { $sort: { avgRevenue: -1 } }
    ]);
};

// ✅ Export the model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;