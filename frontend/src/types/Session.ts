import { User } from "./User";

export type Session = {
  _id: string;
  fromUser: User;  // populated user object
  toUser: User;    // populated user object
  fromUserSkill: string;
  toUserSkill: string;
  scheduledAt?: string;
  message?: string;
  availability?: 'weekdays' | 'weekends' | 'any';
  durationMinutes?: 30 | 60 | 90 | 120;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};
