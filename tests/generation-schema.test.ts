import {describe, expect, it} from "vitest";
import {midiGenerationSchema} from "../shared/schema";

const validRequest = {
    verses: [{ text: "θεός", metrics: "-UU" }],
    instrument: "lyra",
};

describe("midiGenerationSchema", () => {
    it("applies defaults to a valid non-experimental MIDI request", () => {
        const result = midiGenerationSchema.parse(validRequest);

        expect(result.tempo).toBe(120);
        expect(result.mode).toBe("dorian");
        expect(result.outputFormat).toBe("midi");
        expect(result.includeMetronome).toBe(false);
    });

    it("rejects an empty verse list", () => {
        expect(() => midiGenerationSchema.parse({ ...validRequest, verses: [] })).toThrow("At least one verse is required");
    });

    it("rejects an unsupported instrument", () => {
        expect(() => midiGenerationSchema.parse({ ...validRequest, instrument: "organ" })).toThrow("Please select a valid ancient Greek instrument");
    });

    it("rejects tempo outside the supported range", () => {
        expect(() => midiGenerationSchema.parse({ ...validRequest, tempo: 59 })).toThrow();
        expect(() => midiGenerationSchema.parse({ ...validRequest, tempo: 201 })).toThrow();
    });

    it("accepts non-Antiochene experimental settings and applies their defaults", () => {
        const result = midiGenerationSchema.parse({
            ...validRequest,
            tempo: 180,
            mode: "phrygian",
            includeMetronome: true,
            includeAccentTrack: true,
            includeVocalGuide: true,
            allowMelody: true,
            experimental: { rhythmModel: "chronos_ratios" },
        });

        expect(result.experimental).toMatchObject({
            rhythmModel: "chronos_ratios",
            tonos: "dorian",
            genus: "diatonic",
            baseUnit: 250,
            tuningSystem: "equal_temperament",
            ethosMapping: false,
        });
        expect(result.includeMetronome).toBe(true);
        expect(result.allowMelody).toBe(true);
    });

    it("rejects empty verse fields and invalid experimental values", () => {
        expect(() => midiGenerationSchema.parse({ ...validRequest, verses: [{ text: "", metrics: "-" }] })).toThrow("Verse text is required");
        expect(() => midiGenerationSchema.parse({ ...validRequest, verses: [{ text: "x", metrics: "" }] })).toThrow("Metrical pattern is required");
        expect(() => midiGenerationSchema.parse({
            ...validRequest,
            experimental: { rhythmModel: "chronos_ratios", baseUnit: 99 },
        })).toThrow();
    });
});
