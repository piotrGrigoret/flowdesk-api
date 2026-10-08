import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { 
    getUsers,
    registerUser
 } from './users.service.js';
import { userResponseSchema } from './users.schema.js';

const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const usersRoutes = async (app: FastifyInstance) => {

  app.get('/users', {
    schema: {
      response: {
        200: z.array(userResponseSchema),
      },
    },
  }, async () => {
    return getUsers();
  });

  app.post('/users', async (request, reply) => {
    const data = createUserSchema.parse(request.body);

    const user = await registerUser(
      data.email,
      data.password,
    );

    const { password_hash, ...safeUser } = user;
    return reply.status(201).send(safeUser);
  
  });
};