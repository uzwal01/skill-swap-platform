import { Response, Router } from "express"
import { AuthRequest, protect } from "../../middlewares/auth.middleware";
import { Conversation } from "../../models/Conversation";
import mongoose from "mongoose";
import { Message } from "../../models/Message";
import { Session } from "../../models/Session";



const router = Router();

// GET /api/v1/messages/conversation -> my conversations (latest first)
router.get('/conversations', protect, async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;
    const list = await Conversation.find({ participants: userId })
        .sort({ lastMessageAt: -1 })
        .populate('participants', 'name email avatarUrl')
        .lean();

    // Unread counts per conversation for this user
    const convIds = list.map((c: any) => c._id);
    const unreadAgg = await Message.aggregate([
        { $match: { conversation: { $in: convIds }, to: new mongoose.Types.ObjectId(userId), readAt: null } },
        { $group: { _id: '$conversation', count: { $sum: 1 } } }
    ]);
    const unreadMap = unreadAgg.reduce((acc: any, r: any) => { acc[r._id.toString()] = r.count; return acc; }, {});
    const withUnread = list.map((c: any) => ({ ...c, unread: unreadMap[c._id.toString()] || 0 }));
    res.json(withUnread);
}); 


// POST /api/v1/messages/conversation/:otherUserId -> ensure conversation exists
router.post('/conversation/:otherUserId', protect, async (req: AuthRequest, res: Response) => {
    const a = new mongoose.Types.ObjectId(req.user._id);
    const b = new mongoose.Types.ObjectId(req.params.otherUserId);
    const pair = [a, b].sort();   // consistent ordering

    // Allow messaging only if there is at least one accepted session between users
    const allowed = await Session.findOne({
        status: 'accepted',
        $or: [
            { fromUser: a, toUser: b },
            { fromUser: b, toUser: a },
        ],
    }).lean();
    if (!allowed) {
        return res.status(403).json({ message: 'Messaging allowed only after an accepted swap request.' });
    }

    let conv = await Conversation.findOne({ participants: { $all: pair, $size: 2 } });

    if (!conv) {
        conv = await Conversation.create({ participants: pair });
    }
    res.json(conv);
});

// GET /api/v1/messages/:conversationId?cursor=&limit=
router.get('/:conversationId', protect, async (req: AuthRequest, res: Response) => {
    const { conversationId } = req.params;
    const { cursor, limit = 20 } = req.query;
    const q: any = { conversation: conversationId };
    if (cursor) q._id = { $lt: cursor };   // backward pagination
    const items = await Message.find(q)
        .sort({ _id: -1 })
        .limit(Number(limit))
        .lean();
    const nextCursor = items.length ? items[items.length - 1]._id : null;
    res.json({ data: items.reverse(), nextCursor });
});

// Mark messages in a conversation as read for current user
router.post('/:conversationId/read', protect, async (req: AuthRequest, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const result = await Message.updateMany(
        { conversation: conversationId, to: userId, readAt: null },
        { $set: { readAt: new Date() } }
    );
    res.json({ updated: result.modifiedCount });
});

export default router;
