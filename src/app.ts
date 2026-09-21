import Fastify from 'fastify';

import { db } from './db/postgre.js';
import { redis } from './redis/redis.js';

import { usersRoutes } from './users/users.route.js';

export const buildApp = () => {
  const app = Fastify({
    logger: true,
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