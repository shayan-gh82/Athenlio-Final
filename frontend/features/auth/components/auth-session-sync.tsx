"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getMe } from "@/features/auth/api";
import { setAuthenticatedUser, setGuest } from "@/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";
import { isApiConfigured } from "@/lib/api/config";
import { queryKeys } from "@/lib/query/keys";

export function AuthSessionSync() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: isApiConfigured,
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) dispatch(setAuthenticatedUser(query.data));
    if (!isApiConfigured || query.isError) dispatch(setGuest());
  }, [dispatch, query.data, query.isError]);

  useEffect(() => {
    const handleExpiredSession = () => {
      queryClient.removeQueries({ queryKey: queryKeys.me });
      dispatch(setGuest());
    };

    window.addEventListener("athenlio:auth-expired", handleExpiredSession);
    return () => window.removeEventListener("athenlio:auth-expired", handleExpiredSession);
  }, [dispatch, queryClient]);

  return null;
}
