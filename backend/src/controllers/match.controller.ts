import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { User } from "../models/User";



export const getMatches = async (req: AuthRequest, res: Response) => {
    try {
        const currentUser = req.user;

        if (!currentUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Find all users except the current one
        const allUsers = await User.find({ _id: { $ne: currentUser._id } }).select('-password');

        const matches = allUsers.filter((user) => {
            const canTeachYou = user.skillsOffered.some((theirOffered: any) => 
                currentUser.skillsWanted.some((yourWanted: any) => 
                    theirOffered.skill === yourWanted.skill
                )
            );

            const wantsToLearnFromYou = user.skillsWanted.some((theirWanted: any) => 
                currentUser.skillsOffered.some((yourOffered: any) =>
                    theirWanted.skill === yourOffered.skill 
                )
            );

            return canTeachYou && wantsToLearnFromYou;
        });

        res.json(matches);

    } catch (err) {
        console.error('Match Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};