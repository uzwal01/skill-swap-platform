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
    createdAt?: Date; // added because of timestamps
    updatedAt?: Date; // added because of timestamps
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

// Prevent multiple pending requests from the same sender to the same recipient
// Allows multiple requests when the earlier one is not pending anymore.
sessionSchema.index(
  { fromUser: 1, toUser: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

export const Session = mongoose.model<ISession>('Session', sessionSchema);
