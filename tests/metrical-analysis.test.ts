import {describe, expect, it}    from "vitest";
import {MetricalAnalysisService} from "../server/services/metrical-analysis";

describe("MetricalAnalysisService", () => {
    const service = new MetricalAnalysisService();

    it("converts known feet into durations, accents, and explicit boundaries", () => {
        const [verse] = service.processVerses([{ text: "θεός", metrics: "-UU U-" }]);

        expect(verse.metricPatterns.map(pattern => pattern.foot)).toEqual(["-UU", "U-"]);
        expect(verse.durationTablature).toEqual([1, 0.5, 0.5, 0.5, 1]);
        expect(verse.accentTablature).toEqual([1, 0, 0, 0, 1]);
        expect(verse.footBoundaries).toEqual([2, 4]);
        expect(verse.syllableCount).toBe(5);
    });

    it("uses a short-syllable fallback for unknown metric characters", () => {
        const [verse] = service.processVerses([{ text: "x", metrics: "AZ" }]);

        expect(verse.metricPatterns.map(pattern => pattern.foot)).toEqual(["A", "Z"]);
        expect(verse.durationTablature).toEqual([0.5, 0.5]);
        expect(verse.accentTablature).toEqual([0, 0]);
    });

    it("preserves an arsis/thesis pattern and explicit foot boundaries", () => {
        const [verse] = service.processVerses(
            [{ text: "θεός", metrics: "U- -U", arsisThesisPattern: "A-T-T-A" }],
        );

        expect(verse.arsisThesisPattern).toBe("A-T-T-A");
        expect(verse.metricPatterns.map(pattern => pattern.foot)).toEqual(["U-", "-U"]);
        expect(verse.footBoundaries).toEqual([1, 3]);
    });

    it("processes multiple verses independently", () => {
        const verses = service.processVerses([
            { text: "α", metrics: "-" },
            { text: "β", metrics: "U" },
        ]);

        expect(verses).toHaveLength(2);
        expect(verses.map(verse => verse.durationTablature)).toEqual([[1], [0.5]]);
    });

    it("supports anceps and compound feet", () => {
        const [verse] = service.processVerses([{ text: "x", metrics: "X -UU-" }]);

        expect(verse.durationTablature).toEqual([0.75, 1, 0.5, 0.5, 1]);
        expect(verse.accentTablature).toEqual([0.5, 1, 0, 0, 1]);
        expect(verse.footBoundaries).toEqual([0, 4]);
    });
});
