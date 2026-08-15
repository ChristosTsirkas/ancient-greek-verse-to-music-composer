// @vitest-environment jsdom

import {render, screen} from "@testing-library/react";
import userEvent        from "@testing-library/user-event";
import {describe, expect, it} from "vitest";
import MetricalReference from "../../client/src/components/metrical-reference";

describe("MetricalReference", () => {
    it("shows the basic reference patterns by default", () => {
        render(<MetricalReference />);

        expect(screen.getByText("Short syllable (breve)")).toBeInTheDocument();
        expect(screen.queryByText("Three-syllable feet")).not.toBeInTheDocument();
    });

    it("toggles the advanced pattern reference", async () => {
        const user = userEvent.setup();
        render(<MetricalReference />);

        await user.click(screen.getByRole("button", { name: /show advanced metrical patterns/i }));
        expect(screen.getByText("Three-syllable feet")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /hide advanced metrical patterns/i })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /hide advanced metrical patterns/i }));
        expect(screen.queryByText("Three-syllable feet")).not.toBeInTheDocument();
    });
});
