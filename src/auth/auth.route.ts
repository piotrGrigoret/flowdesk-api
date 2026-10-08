import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import {loginUser} from './auth.service.js';
import { loginSchema } from './auth.schema.js';


export const authRoutes = async (app: FastifyInstance) => {
   app.withTypeProvider<ZodTypeProvider>().post('/auth/login', {
    schema: {
      body: loginSchema,
    },
  }, async (request) => {
    const { email, password } = request.body;
    return loginUser(email, password, (payload) => app.jwt.sign(payload));
  });

};