import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false, refetchOnReconnect: true },
      mutations: { retry: 1 },
    },
  });
}
