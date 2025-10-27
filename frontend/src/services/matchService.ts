import api from '@/lib/api';
import { Match } from '@/types/Match';
import { Paginated } from '@/types/Paginated';

// Get mutual skill matches
export const getMutualMatches = async (): Promise<Match[]> => {
  const response = await api.get(`/matches`);
  // Backward-compatible: unwrap if server returns paginated envelope
  return (response.data && response.data.data) ? response.data.data as Match[] : response.data as Match[];
};

export const getMutualMatchesPaged = async (params: { page?: number; limit?: number } = {}): Promise<Paginated<Match>> => {
  const response = await api.get(`/matches`, { params });
  // If server returns array (older), wrap it
  const data = response.data;
  if (Array.isArray(data)) {
    const arr = data as Match[];
    const page = params.page ?? 1;
    const limit = params.limit ?? arr.length;
    return {
      data: arr,
      page,
      limit,
      total: arr.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: page > 1,
    };
  }
  return data as Paginated<Match>;
};
