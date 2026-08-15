import {describe, expect, it} from "vitest";
import {
    capitalizeMode,
    cn,
    formatTempo,
    validateGreekText,
    validateMetrics,
} from "../client/src/lib/utils";

describe("client utility functions", () => {
    it("merges conditional Tailwind classes and resolves conflicts", () => {
        expect(cn("p-2", "p-4")).toBe("p-4");
    });

    it("recognizes Greek text and rejects non-Greek text", () => {
        expect(validateGreekText("Μῆνιν ἄειδε")).toBe(true);
        expect(validateGreekText("Arma virumque cano")).toBe(false);
        expect(validateGreekText("")).toBe(false);
    });

    it("accepts supported metrical symbols and whitespace", () => {
        expect(validateMetrics("-UU U- X")).toBe(true);
        expect(validateMetrics("  U-\n-U  ")).toBe(true);
    });

    it("rejects unsupported metrical notation", () => {
        expect(validateMetrics("-U A")).toBe(false);
        expect(validateMetrics("")).toBe(false);
    });

    it("formats tempo and capitalizes mode labels", () => {
        expect(formatTempo(120)).toBe("120 BPM");
        expect(capitalizeMode("dorian")).toBe("Dorian");
        expect(capitalizeMode("")).toBe("");
    });
});
