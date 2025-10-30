import { Response, Router } from "express"
import { AuthRequest, protect } from "../../middlewares/auth.middleware";
import { Conversation } from "../../models/Conversation";
import mongoose from "mongoose";
import { Message } from "../../models/Message";



const router = Router();

// GET /api/v1/messages/conversation -> my conversations (latest first)
router.get('/conversations', protect, async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;
    const list = await Conversation.find({ participants: userId })
        .sort({ lastMessageAt: -1 })
        .populate('participants', 'name email avatarUrl')
        .lean();
    res.json(list);
}); 


// POST /api/v1/messages/conversation/:otherUserId -> ensure conversation exists
router.post('/conversation/:otherUserId', protect, async (req: AuthRequest, res: Response) => {
    const a = new mongoose.Types.ObjectId(req.user._id);
    const b = new mongoose.Types.ObjectId(req.params.otherUserId);
    const pair = [a, b].sort();   // consistent ordering

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

export default router;