import mongoose, { Schema } from "mongoose";


const ConversationSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

ConversationSchema.index({ participants: 1 }, { unique: true });    // enforce only one conversation between each unique pair

export const Conversation = mongoose.model('Conversation', ConversationSchema);