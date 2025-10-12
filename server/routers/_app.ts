import { router } from '../trpc';
import { tripsRouter } from './trips';
import { stewardRouter } from './steward';

export const appRouter = router({
  trips: tripsRouter,
  steward: stewardRouter,
});

export type AppRouter = typeof appRouter;
