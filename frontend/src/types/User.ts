export type Skill = {
    category: string;
    skill: string;
}


export type User = {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
    skillsOffered: Skill[];
    skillsWanted: Skill[];
    createdAt?: string;
};