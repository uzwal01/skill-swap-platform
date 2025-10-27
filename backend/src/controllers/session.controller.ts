import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Session } from "../models/Session";


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

        res.json(session);
    } catch (err) {
        console.error('Update Session Error');
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
