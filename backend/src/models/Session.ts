import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    fromUser: mongoose.Types.ObjectId;
    toUser: mongoose.Types.ObjectId;
    fromUserSkill: string;  // What I can teach
    toUserSkill: string;    // What I want to learn
    message?: string;
    availability?: 'weekdays' | 'weekends' | 'any';
    durationMinutes?: 30 | 60 | 90 | 120;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
    scheduledAt?: Date;
    completedAt?: Date;
}


const sessionSchema = new Schema<ISession>(
    {
        fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fromUserSkill: { type: String, required: true },
        toUserSkill: { type: String, required: true },
        message: { type: String },
        availability: { type: String, enum: ['weekdays', 'weekends', 'any'] },
        durationMinutes: { type: Number, enum: [30, 60, 90, 120] },
        status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'], default: 'pending' },
        scheduledAt: { type: Date },
        completedAt: { type: Date },
    },
    { timestamps: true }
);

export const Session = mongoose.model<ISession>('Session', sessionSchema);
