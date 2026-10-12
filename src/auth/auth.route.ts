import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import {loginUser} from './auth.service.js';
import { loginSchema } from './auth.schema.js';
import { getUserById } from '../users/users.service.js';
import { userResponseSchema } from '../users/users.schema.js';

export const authRoutes = async (app: FastifyInstance) => {
   const routes = app.withTypeProvider<ZodTypeProvider>();
  
  routes.post('/auth/login', {
    schema: {
      body: loginSchema,
    },
  }, async (request) => {
    const { email, password } = request.body;
    return loginUser(email, password, (payload) => app.jwt.sign(payload));
  });


  routes.get('/auth/me', {
    onRequest: app.authenticate,
    schema: {
      response: {
        200: userResponseSchema,
         404: z.object({
            message: z.string(),
          }),
      },
    },
  }, async (request, reply) => {
    const { sub } = request.user;

    const user = await getUserById(sub);

    if (!user) {
      return reply.status(404).send({
        message: 'User not found',
      });
    }

    return user;
  });
};