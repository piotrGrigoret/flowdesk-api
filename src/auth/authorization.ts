
import type { FastifyRequest, FastifyReply } from 'fastify';

export const requireAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  await request.jwtVerify();

  if (request.user.role !== 'admin') {
    return reply.status(403).send({
      error: 'Forbidden',
    });
  }
};
