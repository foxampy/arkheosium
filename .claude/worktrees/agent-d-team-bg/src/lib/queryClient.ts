import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { EDITION } from "./edition";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const headers: Record<string, string> = {
      "X-Edition": EDITION,
    };
    if (data) headers["Content-Type"] = "application/json";

    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    return res;
  } catch (err) {
    // Network error — return a fake 503 so callers don't crash
    console.warn("apiRequest network error (demo mode):", err);
    return new Response(JSON.stringify({ message: "Network error" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
        headers: {
          "X-Edition": EDITION,
        },
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      // Demo mode: gracefully return null for any API failure
      if (!res.ok) return null;

      return await res.json();
    } catch (err) {
      // Network error in demo mode — return null instead of crashing
      console.warn("API query failed (demo mode):", err);
      return null;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
