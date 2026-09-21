import bcrypt from 'bcrypt';

import {
  createUser,
  findAllUsers,
  type User,
} from './users.repository.js';

export const getUsers = async (): Promise<User[]> => {
  return findAllUsers();
};

export const registerUser = async (
  email: string,
  password: string,
): Promise<User> => {
  const passwordHash = await bcrypt.hash(password, 12);

  return createUser(email, passwordHash);
};