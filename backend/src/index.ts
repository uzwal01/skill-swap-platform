import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'SkillSwap API is working' });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});