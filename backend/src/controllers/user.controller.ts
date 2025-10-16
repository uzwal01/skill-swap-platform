import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { IUser, User } from "../models/User";




export const updateMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const allowed: (keyof IUser)[] = [
            "name",
            "bio",
            "avatarUrl",
            "skillsOffered",
            "skillsWanted",
        ];

        const update: Partial<IUser> = {};
        for (const key of allowed) {
            if (key in req.body) {
                update[key] = req.body[key];
            }
        }

        const updated = await User.findByIdAndUpdate(userId, update, {
            new: true,
        }).select("-password");

        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user: updated });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};