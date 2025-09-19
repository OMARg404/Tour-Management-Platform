const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

// Middleware لتحديد التوب تورز
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,Revenue';
    req.query.fields = 'Country,Category,Visitors,ratingsAverage';
    next();
};

exports.checkID = async(req, res, next, id) => {
    try {
        const tour = await Tour.findOne({ id: Number(id) });
        if (!tour) {
            console.log(`the ID not found 🙄`);
            return res.status(404).json({ message: `Tour ID ${id} not found` });
        }
        req.tour = tour;
        console.log(`the ID found 🦍`);
        next();
    } catch (err) {
        res.status(500).json({ message: 'Error checking tour ID', error: err.message });
    }
};

exports.checkBody = (req, res, next) => {
    if (!req.body.Country || !req.body.Location) {
        return res.status(400).json({
            status: 'fail',
            message: 'Missing Country or Location'
        });
    }
    next();
};

exports.getAllTours = catchAsync(async(req, res) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: { tours },
    });
});

exports.getToursByCountry = catchAsync(async(req, res) => {
    const tours = await Tour.find();
    const countryCounts = tours.reduce((acc, tour) => {
        acc[tour.Country] = (acc[tour.Country] || 0) + 1;
        return acc;
    }, {});
    res.status(200).json({ countryCounts });
});

exports.getTourById = catchAsync(async(req, res) => {
    res.status(200).json({ status: 'success', data: { tour: req.tour } });
});

exports.createTour = catchAsync(async(req, res) => {
    const count = await Tour.countDocuments();
    const newTour = await Tour.create({ id: count + 1, ...req.body });
    res.status(201).json({
        status: 'success',
        message: 'Tour created successfully ✈😎',
        data: { tour: newTour }
    });
});

exports.updateTour = catchAsync(async(req, res) => {
    const updatedTour = await Tour.findOneAndUpdate({ id: Number(req.params.id) },
        req.body, { new: true, runValidators: true }
    );

    if (!updatedTour) return res.status(404).json({ message: 'Tour not found' });

    res.status(200).json({
        status: 'success',
        message: 'Tour updated successfully',
        data: { tour: updatedTour }
    });
});

exports.deleteTour = catchAsync(async(req, res) => {
    const deleted = await Tour.findOneAndDelete({ id: Number(req.params.id) });

    if (!deleted) return res.status(404).json({ message: 'Tour not found' });

    res.status(200).json({
        status: 'success',
        message: 'Tour deleted successfully 🤞🏾',
        data: null
    });
});


exports.getTourStats = catchAsync(async(req, res) => {
    const stats = await Tour.aggregate([
        { $match: { Rating: { $gte: 3 }, Revenue: { $gte: 10000 } } },
        { $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: {
                    country: '$Country',
                    category: '$Category',
                    tag: '$tags'
                },
                numTours: { $sum: 1 },
                totalVisitors: { $sum: '$Visitors' },
                avgRating: { $avg: '$Rating' },
                avgRevenue: { $avg: '$Revenue' },
                minRevenue: { $min: '$Revenue' },
                maxRevenue: { $max: '$Revenue' },
                accommodationYes: {
                    $sum: {
                        $cond: [{ $eq: ['$Accommodation_Available', 'Yes'] }, 1, 0]
                    }
                },
                accommodationNo: {
                    $sum: {
                        $cond: [{ $eq: ['$Accommodation_Available', 'No'] }, 1, 0]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                Country: '$_id.country',
                Category: '$_id.category',
                Tag: '$_id.tag',
                numTours: 1,
                totalVisitors: 1,
                avgRating: { $round: ['$avgRating', 2] },
                avgRevenue: { $round: ['$avgRevenue', 2] },
                minRevenue: 1,
                maxRevenue: 1,
                accommodationYes: 1,
                accommodationNo: 1
            }
        },
        { $sort: { avgRevenue: -1 } }
    ]);

    const countryCount = await Tour.distinct('Country');

    res.status(200).json({
        status: 'success',
        totalCountries: countryCount.length,
        results: stats.length,
        data: stats
    });
});

exports.getTopRevenuePerVisitor = catchAsync(async(req, res) => {
    const top5 = await Tour.getTopRevenuePerVisitor();
    res.status(200).json({
        status: 'success',
        results: top5.length,
        data: top5
    });
});

exports.getStatsPerCountry = catchAsync(async(req, res) => {
    const stats = await Tour.getStatsByCountry();
    res.status(200).json({
        status: 'success',
        results: stats.length,
        data: stats
    });
});