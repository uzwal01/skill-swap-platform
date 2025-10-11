export type User = {
    id: string;
    name: string;
    email: string;
    token: string;  // JWT token if backend sends one
};