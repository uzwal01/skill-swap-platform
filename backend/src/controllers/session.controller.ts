import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Session } from "../models/Session";


// Create New Sessions
export const createSession = async (req: AuthRequest, res: Response) => {
    try {
        const { toUser, fromUserSkill, toUserSkill, scheduledAt } = req.body;

        const session = await Session.create({
            fromUser: req.user._id,
            toUser,
            fromUserSkill,
            toUserSkill,
            scheduledAt,
        });

        res.status(201).json(session);
    } catch (err) {
        console.error('Create Session Error', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Get all user sessions
export const getMySessions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const sessions = await Session.find({
            $or: [{ fromUser: userId }, { toUser: userId }],
        })
            .populate('fromUser', 'name email')
            .populate('toUser', 'name email')
            .sort({ createdAt: -1 });

        res.json(sessions);
    } catch (err) {
        console.error('Get Sessions Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Update a session by recipient
export const updateSessionStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid Status' });
        }

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Only recipient can update the status
        if (session.toUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this session' });
        }

        session.status = status;
        await session.save();

        res.json(session);
    } catch (err) {
        console.error('Update Session Error');
        res.status(500).json({ message: 'Internal Server Error' });
    } 
};


// Delete a pending session by user/sender
export const deleteSession = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const session = await Session.findById(id);


        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Only Sender can delete
        if (session?.fromUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this session' });
        }

        // Only if pending
        if (session.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending sessions can be deleted' });
        }

        await session.deleteOne();

        res.json({ message: 'Session deleted successfully' });

    } catch (err) {
        console.error('Delete Session Error', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};