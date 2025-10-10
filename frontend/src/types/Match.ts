export type Match = {
  userId: string;
  skill: string;
  matchedWith: string; // The user the current user is matched with
  matchScore: number; // A score based on matching criteria (e.g., how well skills match)
};
