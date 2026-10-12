import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { 
    getUsers,
    getUserById,
    registerUser
 } from './users.service.js';
import { userResponseSchema } from './users.schema.js';

const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const userIdParamsSchema = z.object({
  id: z.uuid(),
});

export const usersRoutes = async (app: FastifyInstance) => {

  app.get('/users', {
    preHandler: app.authenticate,
    schema: {
      response: {
        200: z.array(userResponseSchema),
      },
    },
  }, async () => {
    return getUsers();
  });

  app.get('/users/:id', {
    onRequest: app.authenticate,
    schema: {
      params: userIdParamsSchema,
      response: {
        200: userResponseSchema,
        404: z.object({
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    const { id } = userIdParamsSchema.parse(request.params);

    const user = await getUserById(id);

    if (!user) {
      return reply.status(404).send({
        message: 'User not found',
      });
    }

    return user;
  });

  app.post('/users', {
    preHandler: app.authenticate,
  }, async (request, reply) => {
    const data = createUserSchema.parse(request.body);

    const user = await registerUser(
      data.email,
      data.password,
    );

    const { password_hash, ...safeUser } = user;

    return reply.status(201).send(safeUser);
  });
};