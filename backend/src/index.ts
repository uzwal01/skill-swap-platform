import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/v1/auth.routes';
import userRoutes from './routes/v1/users.routes';
import matchRoutes from './routes/v1/matches.routes';
import sessionRoutes from './routes/v1/session.routes';
import messageRoutes from './routes/v1/messages.routes';
import http from 'http';
import { initSocket } from './socket';


dotenv.config();

const app = express();
connectDB();        // Connect to MongoDB

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL 
    credentials: true,  // allows cookies / JWT to be sent
}));

app.use(express.json());




// Routes
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'SkillSwap API is working' });
});

// auth: /Register and /Login
app.use('/api/v1/auth', authRoutes);

// users: /me
app.use('/api/v1/users', userRoutes);

// matches
app.use('/api/v1/matches', matchRoutes);

// Sessions: Create, Get and UpdateStatus
app.use('/api/v1/sessions', sessionRoutes);

// Messages
app.use('/api/v1/messages', messageRoutes);



const server = http.createServer(app);
initSocket(server);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


server.listen(PORT, () => console.log(`API on ${PORT}`));