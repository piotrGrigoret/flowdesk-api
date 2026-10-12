
import '@fastify/jwt';
import type { UserRole } from '../users/users.model.ts';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      role: UserRole;
    };
    user: {
      sub: string;
      email: string;
      role: UserRole;
    };
  }
}
