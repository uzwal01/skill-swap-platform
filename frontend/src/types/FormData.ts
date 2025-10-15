export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  skillsOfferedInput: string;
  skillsWantedInput: string;
};


export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  skillsOffered: { category: string; skill: string }[];
  skillsWanted: { category: string; skill: string }[];
};