const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Tour = require('../models/tourModel'); // تأكد من صحة المسار

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

const DB = process.env.DATABASE;

// Connect to DB
mongoose.connect(DB)
    .then(() => console.log('✔ DB connection successful'))
    .catch((err) => {
        console.error('❌ DB connection failed:', err);
        process.exit(1);
    });

// Read JSON file
const tours = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'tours-simple.json'), 'utf-8')
);

// Option 1: Add only new tours (with id conversion)
const importNewToursOnly = async() => {
    try {
        const existingTours = await Tour.find({}, 'id');
        const existingIds = new Set(existingTours.map(t => t.id));

        // تحويل id من String إلى Number في بيانات JSON قبل الاستيراد
        const sanitizedTours = tours.map(tour => ({
            ...tour,
            id: Number(tour.id)
        }));

        const newTours = sanitizedTours.filter(tour => !existingIds.has(tour.id));

        if (newTours.length === 0) {
            console.log('ℹ No new tours to add. All tours already exist.');
        } else {
            await Tour.insertMany(newTours);
            console.log(`✅ ${newTours.length} new tours added!`);
        }
    } catch (err) {
        console.error('❌ Error importing data:', err);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 DB connection closed');
        process.exit();
    }
};

// Option 2: Replace all existing data (مع تحويل id أيضاً)
const replaceAllTours = async() => {
    try {
        await Tour.deleteMany();

        const sanitizedTours = tours.map(tour => ({
            ...tour,
            id: Number(tour.id)
        }));

        await Tour.create(sanitizedTours);
        console.log('🔁 Tours replaced successfully!');
    } catch (err) {
        console.error('❌ Error replacing data:', err);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 DB connection closed');
        process.exit();
    }
};

// Option 3: Delete all tours
const deleteData = async() => {
    try {
        // تحويل ids من JSON إلى أرقام
        const idsToDelete = tours.map(tour => Number(tour.id));

        // حذف كل المستندات اللي id بتاعها في المصفوفة دي بس
        const result = await Tour.deleteMany({ id: { $in: idsToDelete } });

        console.log(`🗑️ Deleted ${result.deletedCount} tours matching JSON data.`);
    } catch (err) {
        console.error('❌ Error deleting data:', err);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 DB connection closed');
        process.exit();
    }
};


// Command-line handler
const option = process.argv[2];
(async() => {
    if (option === '--import') {
        await importNewToursOnly();
    } else if (option === '--replace') {
        await replaceAllTours();
    } else if (option === '--delete') {
        await deleteData();
    } else {
        console.log('❗ Please provide a valid argument:');
        console.log('   --import   ➜ Add only new tours');
        console.log('   --replace  ➜ Replace all tours with new data');
        console.log('   --delete   ➜ Delete all tours');
        await mongoose.connection.close();
        process.exit();
    }
})();