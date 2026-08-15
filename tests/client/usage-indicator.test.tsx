// @vitest-environment jsdom

import {QueryClient, QueryClientProvider}    from "@tanstack/react-query";
import {render, screen, waitFor}             from "@testing-library/react";
import userEvent                             from "@testing-library/user-event";
import {afterEach, describe, expect, it, vi} from "vitest";
import UsageIndicator                        from "../../client/src/components/usage-indicator";

const renderUsage = (usage: unknown, pending = false) => {
    const client = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                queryFn: () => pending ? new Promise(() => undefined) : Promise.resolve(usage),
            },
        },
    });
    return render(<QueryClientProvider client={client}><UsageIndicator /></QueryClientProvider>);
};

describe("UsageIndicator", () => {
    afterEach(() => vi.restoreAllMocks());
    it("renders a loading placeholder before usage data resolves", () => {
        const {container} = renderUsage(undefined, true);

        expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("renders the unlimited-account state", async () => {
        renderUsage({ isAuthenticated: true, isUnlimited: true, remaining: 10000000 });

        await waitFor(() => expect(screen.getByText("Unlimited access")).toBeInTheDocument());
        expect(screen.getByText(/no usage limits apply/i)).toBeInTheDocument();
    });

    it("renders authenticated usage and the near-limit warning", async () => {
        renderUsage({ isAuthenticated: true, dailyLimit: 10, dailyUsed: 9, remaining: 1 });

        await waitFor(() => expect(screen.getByText(/your daily usage \(9\/10 verses\)/i)).toBeInTheDocument());
        expect(screen.getByText(/approaching your daily usage limit/i)).toBeInTheDocument();
    });

    it("renders anonymous usage and the sign-in guidance", async () => {
        renderUsage({ isAuthenticated: false, totalLimit: 10, totalUsed: 7, remaining: 3 });

        await waitFor(() => expect(screen.getByText(/anonymous user usage \(7\/10 verses\)/i)).toBeInTheDocument());
        expect(screen.getByRole("button", { name: /sign in, for increased daily limits/i })).toBeInTheDocument();
        expect(screen.getByText(/almost at your daily usage limit/i)).toBeInTheDocument();
    });

    it("scrolls to sign-in guidance when requested by an anonymous user", async () => {
        const user = userEvent.setup();
        const scrollIntoView = vi.fn();
        vi.spyOn(document, "querySelector").mockReturnValue({ scrollIntoView } as unknown as Element);
        renderUsage({ isAuthenticated: false, totalLimit: 10, totalUsed: 1, remaining: 9 });

        const signInButton = await screen.findByRole("button", { name: /sign in, for increased daily limits/i });
        await user.click(signInButton);

        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    });
});
