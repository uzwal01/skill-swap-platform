import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Session } from "../models/Session";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import mongoose from "mongoose";
import { notifySessionCreated, notifySessionUpdated } from "../socket";


// Create New Sessions
export const createSession = async (req: AuthRequest, res: Response) => {
    try {
        const { toUser, fromUserSkill, toUserSkill, scheduledAt, message, availability, durationMinutes } = req.body;

        const allowedAvailability = ['weekdays', 'weekends', 'any'];
        if (availability && !allowedAvailability.includes(availability)) {
            return res.status(400).json({ message: 'Invalid availability' });
        }

        const allowedDurations = [30, 60, 90, 120];
        if (durationMinutes && !allowedDurations.includes(Number(durationMinutes))) {
            return res.status(400).json({ message: 'Invalid duration' });
        }

        const session = await Session.create({
            fromUser: req.user._id,
            toUser,
            fromUserSkill,
            toUserSkill,
            scheduledAt,
            message,
            availability,
            durationMinutes,
        });

        // Notify both users in real-time
        try {
            notifySessionCreated(String(req.user._id), session);
            notifySessionCreated(String(toUser), session);
        } catch {}

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
        const { type, status } = req.query as { type?: string; status?: string };

        // Build base filter
        const filter: any = {};
        if (type === 'incoming') {
            filter.toUser = userId;
        } else if (type === 'outgoing') {
            filter.fromUser = userId;
        } else {
            filter.$or = [{ fromUser: userId }, { toUser: userId }];
        }

        if (status) {
            filter.status = status;
        }

        // Pagination
        const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
        const limitRaw = parseInt(String(req.query.limit ?? '10'), 10) || 10;
        const limit = Math.max(1, Math.min(50, limitRaw));
        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            Session.countDocuments(filter),
            Session.find(filter)
                .populate('fromUser', 'name email')
                .populate('toUser', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));
        const hasNext = page * limit < total;
        const hasPrev = page > 1;

        res.json({ data, page, limit, total, totalPages, hasNext, hasPrev });
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

        const validStatuses = ['accepted', 'rejected', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid Status' });
        }

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Cancelled by user
        if (status === 'cancelled') {
            if (session.fromUser.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Only sender can cancel the session' });
            }
        }

        // Completed by either user or recipient, but only after acceptance
        else if (status === 'completed') {
            if(!['accepted'].includes(session.status)) {
                return res.status(400).json({ message: 'Cannot complete unaccepted session' });
            }

            // mark who completed the session
            session.completedAt = new Date();

        }

        // Only recipient can update the status: Accepted or Rejected
        else {
            if (session.toUser.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this session' });
            }
        }


        session.status = status;
        await session.save();

        // Seed a first message when a request is accepted, carrying the original request details.
        if (status === 'accepted') {
            try {
                const a = new mongoose.Types.ObjectId(session.fromUser as any);
                const b = new mongoose.Types.ObjectId(session.toUser as any);
                const pair = [a, b].sort();
                let conv = await Conversation.findOne({ participants: { $all: pair, $size: 2 } });
                if (!conv) {
                    conv = await Conversation.create({ participants: pair });
                }
                const seed = [
                    `Skill Request: I would like to learn ${session.toUserSkill} and can offer ${session.fromUserSkill} in exchange.`,
                    session.message ? `Message: ${session.message}` : undefined,
                    session.availability ? `Availability: ${session.availability}` : undefined,
                    session.durationMinutes ? `Session Duration: ${session.durationMinutes} minutes` : undefined,
                ].filter(Boolean).join(' ');
                if (seed) {
                    await Message.create({
                        conversation: conv._id,
                        from: session.fromUser as any,
                        to: session.toUser as any,
                        text: seed,
                    });
                    await Conversation.findByIdAndUpdate(conv._id, { lastMessageAt: new Date() });
                }
            } catch (e) {
                // Non-fatal; seeding message failure should not block status update
                console.error('Failed to seed acceptance message', e);
            }
        }

        // Notify both users about the update
        try {
            notifySessionUpdated(String(session.fromUser), session);
            notifySessionUpdated(String(session.toUser), session);
        } catch {}

        res.json(session);
    } catch (err) {
        console.error('Update Session Error');
        res.status(500).json({ message: 'Internal Server Error' });
    } 
};


// Check if current user can message a given user (has an accepted session)
export const canMessageWithUser = async (req: AuthRequest, res: Response) => {
    try {
        const me = req.user._id;
        const other = req.params.userId;
        const exists = await Session.findOne({
            status: 'accepted',
            $or: [
                { fromUser: me, toUser: other },
                { fromUser: other, toUser: me },
            ],
        }).lean();   // lean() to reduce DB overhead
        res.json({ canMessage: !!exists });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// // Delete a pending session by user/sender
// export const deleteSession = async (req: AuthRequest, res: Response) => {
//     try {
//         const { id } = req.params;
//         const session = await Session.findById(id);


//         if (!session) {
//             return res.status(404).json({ message: 'Session not found' });
//         }

//         // Only Sender can delete
//         if (session?.fromUser.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ message: 'Not authorized to delete this session' });
//         }

//         // Only if pending
//         if (session.status !== 'pending') {
//             return res.status(400).json({ message: 'Only pending sessions can be deleted' });
//         }

//         await session.deleteOne();

//         res.json({ message: 'Session deleted successfully' });

//     } catch (err) {
//         console.error('Delete Session Error', err);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };
