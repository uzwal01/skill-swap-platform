import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from "../middlewares/auth.middleware";




export const getMe = (req: AuthRequest, res: Response) => {
    res.json(req.user);   // req.user is set by the middleware
}

// Register User
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, skillsOffered, skillsWanted } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            skillsOffered,
            skillsWanted,
        });

        const JWT_SECRET = process.env.JWT_SECRET as string;

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                skillsOffered: newUser.skillsOffered,
                skillsWanted: newUser.skillsWanted,
            },
            token,
        });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



// Login User
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const JWT_SECRET = process.env.JWT_SECRET as string;

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                skillsOffered: user.skillsOffered,
                skillsWanted: user.skillsWanted,
            },
            token,
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Get Current User
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('-password'); // exclude password
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

