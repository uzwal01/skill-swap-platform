import mongoose, { Schema, Document } from 'mongoose';


type Skill = {
    category: string;
    skill: string;
}


export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatarUrl?: string;
    bio?: string;
    skillsOffered: Skill[];
    skillsWanted: Skill[];
    createdAt: Date;
}


const SkillSchema = new Schema<Skill>(
    {
        category: { type: String, required: true },
        skill: { type: String, required: true },
    },
    { _id: false }
);


const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        avatarUrl: { type: String },
        bio: { type: String },
        skillsOffered: [SkillSchema],
        skillsWanted: [SkillSchema],
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Hide the Password keyword while displaying json responses
UserSchema.set('toJSON', {
    transform: function(doc, ret: any) {
        delete ret.password;
        return ret;
    }
})


export const User = mongoose.model<IUser>('User', UserSchema);