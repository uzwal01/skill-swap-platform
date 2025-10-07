import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    fromUser: mongoose.Types.ObjectId;
    toUser: mongoose.Types.ObjectId;
    fromUserSkill: string;  // What I can teach
    toUserSkill: string;    // What I want to learn
    status: 'pending' | 'accepted' | 'rejected';
    scheduledAt?: Date;
}


const sessionSchema = new Schema<ISession>(
    {
        fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fromUserSkill: { type: String, required: true },
        toUserSkill: { type: String, required: true },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        scheduledAt: { type: Date },
    },
    { timestamps: true }
);

export const Session = mongoose.model<ISession>('Session', sessionSchema);