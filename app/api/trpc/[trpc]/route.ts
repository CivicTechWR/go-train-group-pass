import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/server/trpc';
import { logger } from '@/lib/logger';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) =>
            logger.error('tRPC request failed', {
              path: path ?? '<no-path>',
              message: error.message,
            })
        : undefined,
  });

export { handler as GET, handler as POST };
