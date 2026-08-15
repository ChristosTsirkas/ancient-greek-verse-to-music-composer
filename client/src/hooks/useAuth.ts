// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {useEffect}                             from "react";

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
}

/** Returns the current authentication state and user profile. */
export function useAuth() {
    const {
              data: user,
              isLoading,
              error,
              refetch,
          } = useQuery({
                           queryKey:             ['/api/auth/user'],
                           retry:                false,
                           staleTime:            30 * 1000, // 30 seconds
                           refetchOnWindowFocus: true,
                       });
    
    // Check for login success parameter and refetch
    useEffect(() => {
                  const urlParams = new URLSearchParams(window.location.search);
                  if (urlParams.get('login') === 'success') {
                      console.log('Login success detected, refetching user data');
                      refetch().then(r => {});
                      // Clean up URL
                      window.history.replaceState({},
                                                  document.title,
                                                  window.location.pathname);
                  }
              },
              [refetch]);
    
    console.log('useAuth - user data:',
                user);
    console.log('useAuth - isLoading:',
                isLoading);
    console.log('useAuth - isAuthenticated:',
                !!user);
    
    return {
        user:            user as User | undefined,
        isLoading,
        isAuthenticated: !!user,
        error,
    };
}

/** Returns the mutation used to end the current authenticated session. */
export function useLogout() {
    const queryClient = useQueryClient();
    
    return useMutation({
                           mutationFn: () => fetch('/auth/logout',
                                                   {
                                                       method:      'POST',
                                                       credentials: 'include',
                                                       headers:     { 'Content-Type': 'application/json' },
                                                   }),
                           onSuccess:  () => {
                               // Clear all cached data
                               queryClient.clear();
                               // Force a page reload to ensure clean state
                               setTimeout(() => window.location.reload(),
                                          500);
                           },
                           onError:    (error) => {
                               console.error('Logout error:',
                                             error);
                               // Even if logout fails, clear local cache and reload
                               queryClient.clear();
                               setTimeout(() => window.location.reload(),
                                          500);
                           },
                       });
}

/** Returns the on-demand query definition for a user's download history. */
export function useDownloadHistory() {
    return useQuery({
                        queryKey: ['/api/downloads/history'],
                        enabled:  false, // Only fetch when explicitly requested
                    });
}
