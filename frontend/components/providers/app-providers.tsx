"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Provider as ReduxProvider } from "react-redux";

import { Toaster } from "@/components/ui/sonner";
import { AuthSessionSync } from "@/features/auth/components/auth-session-sync";
import { makeStore, type AppStore } from "@/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(makeStore);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthSessionSync />
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
