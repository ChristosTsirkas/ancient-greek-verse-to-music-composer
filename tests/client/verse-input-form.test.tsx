// @vitest-environment jsdom

import {fireEvent, render, screen} from "@testing-library/react";
import userEvent                   from "@testing-library/user-event";
import {describe, expect, it, vi}  from "vitest";
import VerseInputForm              from "../../client/src/components/verse-input-form";

const settings = {
    instrument: "lyra" as const,
    tempo: 120,
    mode: "dorian" as const,
    includeMetronome: false,
    outputFormat: "midi" as const,
};

describe("VerseInputForm", () => {
    it("updates text and metrics through the supplied callbacks", async () => {
        const onUpdateVerse = vi.fn();
        render(
            <VerseInputForm
                verses={[{ text: "old", metrics: "-U" }]}
                settings={settings}
                onAddVerse={vi.fn()}
                onRemoveVerse={vi.fn()}
                onUpdateVerse={onUpdateVerse}
            />,
        );

        fireEvent.change(screen.getByLabelText("Text:"), { target: { value: "new text" } });
        fireEvent.change(screen.getByLabelText("Metrical pattern:"), { target: { value: "UU-" } });

        expect(onUpdateVerse).toHaveBeenCalledWith(0, "text", "new text");
        expect(onUpdateVerse).toHaveBeenCalledWith(0, "metrics", "UU-");
    });

    it("adds a verse and exposes removal only when multiple verses exist", async () => {
        const user = userEvent.setup();
        const onAddVerse = vi.fn();
        const onRemoveVerse = vi.fn();
        const props = {
            settings,
            onAddVerse,
            onRemoveVerse,
            onUpdateVerse: vi.fn(),
        };
        const {rerender} = render(<VerseInputForm {...props} verses={[{ text: "one", metrics: "-" }]} />);

        expect(screen.queryByRole("button", { name: /remove verse/i })).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /add another verse/i }));
        expect(onAddVerse).toHaveBeenCalledOnce();

        rerender(<VerseInputForm {...props} verses={[{ text: "one", metrics: "-" }, { text: "two", metrics: "U" }]} />);
        await user.click(screen.getAllByRole("button", { name: /remove verse/i })[1]);
        expect(onRemoveVerse).toHaveBeenCalledWith(1);
    });
});
