
import api from "@/lib/api";
import { UserProfile } from "@/types/UserProfile";



// Fetch user profile
export const getUserProfile = async (): Promise<UserProfile> => {
    const response = await api.get('/users/profile');
    return response.data;  // This will be of type UserProfile
};


// Update user profile
export const updateUserProfile = async (data: UserProfile): Promise<UserProfile> => {
    const response = await api.put('/users/profile', data);
    return response.data;   // This will be of type UserProfile
};