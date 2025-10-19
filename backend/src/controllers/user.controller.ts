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

export const getFeaturedUsers = async (_req: AuthRequest, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(6).select('-password');
  res.json(users);
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  const { search, category, skill } = req.query;
  const filters: any = {};

  if (search) {
    filters.$or = [
      { name: new RegExp(String(search), 'i') },
      { 'skillsOffered.skill': new RegExp(String(search), 'i') },
      { 'skillsOffered.category': new RegExp(String(search), 'i') },
      { 'skillsWanted.skill': new RegExp(String(search), 'i') },
    ];
  }

  if (category) {
    filters['$or'] = [
      { 'skillsOffered.category': category },
      { 'skillsWanted.category': category },
    ];
  }

  if (skill) {
    filters['$or'] = [
      { 'skillsOffered.skill': skill },
      { 'skillsWanted.skill': skill },
    ];
  }

  const users = await User.find(filters).select('-password');
  res.json(users);
};
