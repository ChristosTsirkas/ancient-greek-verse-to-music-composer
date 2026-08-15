// @vitest-environment jsdom

import {render, screen} from "@testing-library/react";
import userEvent        from "@testing-library/user-event";
import {describe, expect, it, vi} from "vitest";
import ArsisThesisMapper from "../../client/src/components/arsis-thesis-mapper";

describe("ArsisThesisMapper", () => {
    it("does not render a mapper when the verse has no syllables", () => {
        const {container} = render(<ArsisThesisMapper verse={{ text: "   ", metrics: "U" }} onPatternChange={vi.fn()} />);

        expect(container.childElementCount).toBe(0);
    });

    it("enables mapping, switches genus, and emits a complete pattern", async () => {
        const user = userEvent.setup();
        const onPatternChange = vi.fn();
        const onGenusChange = vi.fn();
        render(
            <ArsisThesisMapper
                verse={{ text: "one-two", metrics: "U-" }}
                onPatternChange={onPatternChange}
                onGenusChange={onGenusChange}
            />,
        );

        await user.click(screen.getByRole("checkbox", { name: /enable arsis\/thesis pattern/i }));
        expect(onGenusChange).toHaveBeenCalledWith("enharmonic");

        await user.click(screen.getAllByRole("button", { name: "A" })[0]);
        expect(onPatternChange).toHaveBeenLastCalledWith(undefined);
        expect(screen.queryByText("A-?")).not.toBeNull();

        await user.click(screen.getAllByRole("button", { name: "T" })[1]);
        expect(onPatternChange).toHaveBeenLastCalledWith("A-T");
    });

    it("clears the pattern and restores diatonic genus when disabled", async () => {
        const user = userEvent.setup();
        const onPatternChange = vi.fn();
        const onGenusChange = vi.fn();
        render(
            <ArsisThesisMapper
                verse={{ text: "one-two", metrics: "U-", arsisThesisPattern: "A-T" }}
                onPatternChange={onPatternChange}
                onGenusChange={onGenusChange}
            />,
        );

        await user.click(screen.getByRole("checkbox", { name: /enable arsis\/thesis pattern/i }));

        expect(onPatternChange).toHaveBeenCalledWith(undefined);
        expect(onGenusChange).toHaveBeenCalledWith("diatonic");
    });

    it("updates the no-marking fallback option", async () => {
        const user = userEvent.setup();
        const onUpdateExperimental = vi.fn();
        render(
            <ArsisThesisMapper
                verse={{ text: "one", metrics: "U", arsisThesisPattern: "A" }}
                onPatternChange={vi.fn()}
                experimental={{ noAccentFallback: false }}
                onUpdateExperimental={onUpdateExperimental}
            />,
        );

        await user.click(screen.getByRole("checkbox", { name: /disable arsis\/thesis pitch marking entirely/i }));
        expect(onUpdateExperimental).toHaveBeenCalledWith({ noAccentFallback: true });
    });
});
