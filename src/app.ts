import Fastify from 'fastify';

import { db } from './db/postgre.js';
import { redis } from './redis/redis.js';
import { z } from 'zod';
import { usersRoutes } from './users/users.route.js';
import { ZodTypeProvider, validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';

export const buildApp = () => {
  const app = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler(function (error, request, reply) {
    app.log.error(error);

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: error.issues,
      });
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      return reply.status(409).send({
        error: 'Email already exists',
      });
    }

    reply.status(500).send({
      error: 'Internal Server Error',
    });
  });

  app.register(usersRoutes);


  app.get('/health', async () => {
    return {
      status: 'ok',
    };
  });

  app.get('/ready', async (_request, reply) => {
    try {
      await db.query('SELECT 1');
      await redis.ping();

      return {
        status: 'ok',
        dependencies: {
          postgres: 'ok',
          redis: 'ok',
        },
      };
    } catch (error) {
      app.log.error(error);

      return reply.status(503).send({
        status: 'not_ready',
      });
    }
  });

  return app;
};