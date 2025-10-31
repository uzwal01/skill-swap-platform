import mongoose, { Schema } from "mongoose";
import { Conversation } from "./Conversation";


const MessageSchema = new Schema({
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    readAt: { type: Date },
}, { timestamps: true });

MessageSchema.index({ conversation: 1, createdAt: -1 });

export const Message = mongoose.model('Message', MessageSchema);
