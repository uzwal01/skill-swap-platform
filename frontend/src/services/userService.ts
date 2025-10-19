import api from "@/lib/api";
import { User } from "@/types/User";

// Payload for updating current user profile
export type UpdateProfilePayload = Partial<Pick<
  User,
  "name" | "bio" | "avatarUrl" | "skillsOffered" | "skillsWanted"
>>;

// Fetch current user's profile
export const getMyProfile = async (): Promise<User> => {
  const response = await api.get("/users/me");
  const data = response.data;
  // BE may return either the user directly or { user }
  return (data && data.user ? data.user : data) as User;
};

// Update current user's profile
export const updateProfile = async (
  data: UpdateProfilePayload
): Promise<User> => {
  const response = await api.put("/users/me", data);
  return response.data.user as User;
};


export const getFeaturedUsers = async (): Promise<User[]> => {
  const response = await api.get('/users/featured');
  return response.data as User[];
};

export type BrowseUsersQuery = {
  search?: string;
  category?: string;
  skill?: string;
};

export const browseUsers = async (query: BrowseUsersQuery): Promise<User[]> => {
  const response = await api.get('/users', { params: query });
  return response.data;
};
