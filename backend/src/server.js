import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import searchWorker from './workers/searchWorker.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('✅ Search worker initialized and ready');
});
