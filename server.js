const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE;
mongoose.connect(DB, {
        useNewUrlParser: true,
    })
    .then(() => console.log(`DB Connection ✔✔`))
    .catch(err => {
        console.error('❌ DB connection error:', err.message);
        console.error('📍 Stack Trace:', err.stack);
        process.exit(1);
    });

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}/`);
}).on('error', (err) => {
    console.error('❌ Server startup error:', err.message);
    console.error('📍 Stack Trace:', err.stack);
    process.exit(1);
});