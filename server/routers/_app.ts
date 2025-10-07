import { router } from '../trpc';
import { tripsRouter } from './trips';

export const appRouter = router({
  trips: tripsRouter,
});

export type AppRouter = typeof appRouter;
