import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { captureError, initSentry } from "./lib/sentry";

export const getRouter = () => {
  initSentry();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { throwOnError: false },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  router.subscribe("onBeforeLoad", () => {});
  const originalOnError = window?.onerror;
  void originalOnError;

  return router;
};
