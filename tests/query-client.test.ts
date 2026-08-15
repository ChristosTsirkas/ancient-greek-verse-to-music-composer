import {afterEach, describe, expect, it, vi} from "vitest";
import {apiRequest, getQueryFn}              from "../client/src/lib/queryClient";

const response = (body: string, status = 200, contentType = "application/json") =>
    new Response(body, { status, headers: { "Content-Type": contentType } });

describe("API request helpers", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("sends JSON requests with credentials and returns successful responses", async () => {
        const fetchMock = vi.fn().mockResolvedValue(response('{"ok":true}'));
        vi.stubGlobal("fetch", fetchMock);

        const result = await apiRequest("POST", "/api/example", { value: 1 });

        expect(result.ok).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith("/api/example", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: '{"value":1}',
            credentials: "include",
        });
    });

    it("exposes JSON API errors as their message", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response('{"error":"Invalid metrics"}', 400)));

        await expect(apiRequest("POST", "/api/example", {})).rejects.toThrow("Invalid metrics");
    });

    it("falls back to a status-prefixed message for non-JSON errors", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response("Server unavailable", 503, "text/plain")));

        await expect(apiRequest("GET", "/api/example")).rejects.toThrow("503: Server unavailable");
    });

    it("returns null for configured unauthorized queries", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response("Unauthorized", 401, "text/plain")));
        const query = getQueryFn<unknown>({ on401: "returnNull" });

        await expect(query({ queryKey: ["/api/user"] } as never)).resolves.toBeNull();
    });

    it("throws for unauthorized queries configured to fail", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response('{"error":"Authentication required"}', 401)));
        const query = getQueryFn<unknown>({ on401: "throw" });

        await expect(query({ queryKey: ["/api/user"] } as never)).rejects.toThrow("Authentication required");
    });
});
