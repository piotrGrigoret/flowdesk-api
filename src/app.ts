import Fastify from 'fastify';

import { db } from './db/postgre.js';
import { redis } from './redis/redis.js';
import { z } from 'zod';
import { ZodTypeProvider, validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import fastifyJWT from '@fastify/jwt';

import { AppError } from './errors/app.error.js';

import { usersRoutes } from './users/users.route.js';
import { authRoutes } from './auth/auth.route.js';

import type { FastifyReply, FastifyRequest } from 'fastify';

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

  app.register(fastifyJWT, {
    secret: process.env.JWT_SECRET!,
  });

  app.decorate('authenticate', async function (
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    await request.jwtVerify();
  });
  
  app.setValidatorCompiler(validatorCompiler);
  
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler(function (error, request, reply) {
    app.log.error(error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'FST_ERR_VALIDATION' &&
      'validation' in error
    ) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: error.validation,
      });
    }
    
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

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.message,
      });
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof error.statusCode === 'number' &&
      error.statusCode >= 400 &&
      error.statusCode < 500 &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return reply.status(error.statusCode).send({
        error: error.message,
      });
    }

    reply.status(500).send({
      error: 'Internal Server Error',
    });
  });

  app.register(usersRoutes);
  app.register(authRoutes);

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