import {QueryClient, QueryFunction} from "@tanstack/react-query";

/** Converts unsuccessful API responses into descriptive errors. */
async function throwIfResNotOk(res: Response) {
    if (!res.ok) {
        let text: string;
        try {
            text = (
                       await res.text()
                   ) || res.statusText;
        }
        catch {
            text = res.statusText;
        }
        
        // Parse JSON error responses to extract just the error message
        try {
            const errorData = JSON.parse(text);
            // Extract error message from JSON response
            if (errorData.error) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error(errorData.error);
            }
            if (errorData.success === false && errorData.error) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error(errorData.error);
            }
        }
        catch (parseError) {
            // If JSON parsing fails, check if the text looks like JSON and extract manually
            if (text.includes('"error":')) {
                const errorMatch = text.match(/"error"\s*:\s*"([^"]+)"/);
                if (errorMatch) {
                    throw new Error(errorMatch[1]);
                }
            }
        }
        
        // If no error extracted, throw the original response
        throw new Error(`${res.status}: ${text}`);
    }
}

/** Sends a JSON API request and rejects unsuccessful responses. */
export async function apiRequest(
    method: string,
    url: string,
    data?: unknown | undefined,
): Promise<Response> {
    const res = await fetch(url,
                            {
                                method,
                                headers:     data ? { "Content-Type": "application/json" } : {},
                                body:        data ? JSON.stringify(data) : undefined,
                                credentials: "include",
                            });
    
    await throwIfResNotOk(res);
    return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
    on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
                 ({ on401: unauthorizedBehavior }) =>
                     async ({ queryKey }) => {
                         const res = await fetch(queryKey[0] as string,
                                                 {
                                                     credentials: "include",
                                                 });
                         
                         if (unauthorizedBehavior === "returnNull" && res.status === 401) {
                             return null;
                         }
                         
                         await throwIfResNotOk(res);
                         return await res.json();
                     };

export const queryClient = new QueryClient({
                                               defaultOptions: {
                                                   queries:   {
                                                       queryFn:              getQueryFn({ on401: "returnNull" }),
                                                       refetchInterval:      false,
                                                       refetchOnWindowFocus: false,
                                                       staleTime:            30 * 1000, // 30 seconds
                                                       retry:                false,
                                                   },
                                                   mutations: {
                                                       retry: false,
                                                   },
                                               },
                                           });
