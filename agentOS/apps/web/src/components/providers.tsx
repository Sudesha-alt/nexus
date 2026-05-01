"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { setAuthToken } from "@/lib/api";

function AuthSync({ serverAccessToken }: { serverAccessToken?: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const lastToken = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const token = session?.accessToken ?? serverAccessToken ?? null;
    setAuthToken(token);

    if (lastToken.current !== token) {
      lastToken.current = token;
      if (token) {
        void queryClient.invalidateQueries();
      }
    }
  }, [session?.accessToken, serverAccessToken, queryClient]);

  return null;
}

export function Providers({
  children,
  accessToken,
}: {
  children: React.ReactNode;
  accessToken?: string;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              const status = (error as { response?: { status?: number } })?.response?.status;
              if (status === 401 || status === 403) return false;
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthSync serverAccessToken={accessToken} />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
