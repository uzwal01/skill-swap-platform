import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';


dotenv.config();

const app = express();
connectDB();        // Connect to MongoDB

// Middleware
app.use(cors());
app.use(express.json());


// Route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'SkillSwap API is working' });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});