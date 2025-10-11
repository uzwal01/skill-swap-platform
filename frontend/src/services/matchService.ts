import api from '@/lib/api';
import { Match } from '@/types/Match';

// Get mutual skill matches
export const getMutualMatches = async (skill: string): Promise<Match[]> => {
  const response = await api.get(`/matches?skill=${skill}`);
  return response.data;
};
