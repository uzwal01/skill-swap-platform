import api from '@/lib/api';
import { Match } from '@/types/Match';

// Get mutual skill matches
export const getMutualMatches = async (): Promise<Match[]> => {
  const response = await api.get(`/matches`);
  return response.data;
};
