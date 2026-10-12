
export type UserRole = 'user' | 'admin';

export type User = {
  id: string;
  email: string;
  password_hash: string;
   role: UserRole;
  created_at: Date;
  updated_at: Date;
};

export type PublicUser = {
  id: string;
  email: string;
  role: UserRole; 
  created_at: Date;
  updated_at: Date;
};