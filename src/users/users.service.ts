import bcrypt from 'bcrypt';

import {
  createUser,
  findAllUsers
} from './users.repository.js';

import type { UserResponse } from './users.schema.js';
import type { User } from './users.model.js';


export const getUsers = async (): Promise<UserResponse[]> => {
  const users = await findAllUsers();

  return users.map((user) => ({
    ...user,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
  }));
};

export const registerUser = async (
  email: string,
  password: string,
): Promise<User> => {
  const passwordHash = await bcrypt.hash(password, 12);

  return createUser(email, passwordHash);
};