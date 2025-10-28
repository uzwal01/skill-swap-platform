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

  // Build filters using AND of independent OR clauses to avoid overwriting
  const and: any[] = [];

  if (search) {
    const q = String(search);
    and.push({
      $or: [
        { name: new RegExp(q, 'i') },
        { 'skillsOffered.skill': new RegExp(q, 'i') },
        { 'skillsOffered.category': new RegExp(q, 'i') },
        { 'skillsWanted.skill': new RegExp(q, 'i') },
      ],
    });
  }

  if (category) {
    const c = new RegExp(String(category), 'i');
    and.push({
      $or: [
        { 'skillsOffered.category': c },
        { 'skillsWanted.category': c },
      ],
    });
  }

  if (skill) {
    const s = new RegExp(String(skill), 'i');
    and.push({
      $or: [
        { 'skillsOffered.skill': s },
        { 'skillsWanted.skill': s },
      ],
    });
  }

  const filters: any = and.length ? { $and: and } : {};

  // Pagination params with sane defaults and caps
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limitRaw = parseInt(String(req.query.limit ?? '12'), 10) || 12;
  const limit = Math.max(1, Math.min(50, limitRaw));
  const skip = (page - 1) * limit;

  const [total, data] = await Promise.all([
    User.countDocuments(filters),
    User.find(filters)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasNext = page * limit < total;
  const hasPrev = page > 1;

  res.json({ data, page, limit, total, totalPages, hasNext, hasPrev });
};
