import {describe, expect, it}                 from "vitest";
import {MidiGeneratorService, type MidiTrack} from "../server/services/midi-generator";
import type {ProcessedVerse}                  from "../server/services/metrical-analysis";

const singleLongVerse: ProcessedVerse = {
    text:              "x",
    originalMetrics:   "-",
    metricPatterns:    [{foot: "-", durations: [1], accents: [1]}],
    durationTablature: [1],
    accentTablature:   [1],
    syllableCount:     1,
    footBoundaries:    [0],
};

function createRhythmTrack(
    verse: ProcessedVerse,
    rhythmicCells: "standard" | "dochmiac_paeon_cretic" | "paeon_cretic_iamb",
    melismaticOrnamentation = false,
): MidiTrack {
    const service = new MidiGeneratorService(1);
    return (service as any).createRhythmTrack(
        [verse],
        "aulos",
        "dorian",
        {
            rhythmModel: "antiochene_scenic",
            baseUnit: 260,
            antiocheneFeatures: {
                rhythmicCells,
                melismaticOrnamentation,
                antiphonalResponse: false,
                pantomimeLayer: false,
            },
        },
        false,
    );
}

function createSapphicTrack(verse: ProcessedVerse): MidiTrack {
    const service = new MidiGeneratorService(1);
    return (service as any).createRhythmTrack(
        [verse],
        "aulos",
        "dorian",
        {rhythmModel: "sapphic_lyric", baseUnit: 280},
        false,
    );
}

describe("MidiGeneratorService melismatic ornamentation", () => {
    it("emits one primary note pair and releases every ornament", () => {
        const track = createRhythmTrack(singleLongVerse, "standard", true);
        const noteEvents = track.events.filter(event =>
            event.type === "note_on" || event.type === "note_off",
        );
        const noteOns = noteEvents.filter(event => event.type === "note_on");
        const noteOffs = noteEvents.filter(event => event.type === "note_off");
        const primaryNote = noteOns[0].data[0];

        expect(noteOns.filter(event => event.data[0] === primaryNote)).toHaveLength(1);
        expect(noteOffs.filter(event => event.data[0] === primaryNote)).toHaveLength(1);
        expect(noteOns).toHaveLength(4);
        expect(noteOffs).toHaveLength(4);

        for (const noteOn of noteOns) {
            // noinspection JSVoidFunctionReturnValueUsed
            expect(noteOffs.filter(event => event.data[0] === noteOn.data[0])).toHaveLength(1);
        }
    });

    it("does not alter the primary note when the ornament layer is enabled", () => {
        const plain = createRhythmTrack(singleLongVerse, "standard");
        const ornamented = createRhythmTrack(singleLongVerse, "standard", true);
        const primaryOn = plain.events.find(event => event.type === "note_on");
        const primaryOff = plain.events.find(event => event.type === "note_off");

        expect(ornamented.events).toContainEqual(primaryOn);
        expect(ornamented.events).toContainEqual(primaryOff);
    });
});

describe("MusicXML duration notation", () => {
    it("uses a matching conventional type when the MIDI-tick duration permits one", () => {
        const service = new MidiGeneratorService(1);
        const xml = (service as any).createMusicXml({
            channel:    0,
            instrument: 24,
            events:     [
                {type: "note_on", time: 0, data: [60, 100]},
                {type: "note_off", time: 960, data: [60, 0]},
            ],
        }, 120, "lyra");

        expect(xml).toContain("<duration>960</duration><voice>1</voice><type>half</type>");
    });

    it("retains an arbitrary application duration without falsely calling it a quarter note", () => {
        const service = new MidiGeneratorService(1);
        const xml = (service as any).createMusicXml({
            channel:    0,
            instrument: 24,
            events:     [
                {type: "note_on", time: 0, data: [60, 100]},
                {type: "note_off", time: 456, data: [60, 0]},
            ],
        }, 120, "lyra");

        expect(xml).toContain("<duration>456</duration><voice>1</voice><velocity>100</velocity>");
        expect(xml).not.toContain("<duration>456</duration><voice>1</voice><type>quarter</type>");
    });
});

describe("MidiGeneratorService rhythmic-cell modifier cycles", () => {
    const dochmiac: ProcessedVerse = {
        text:              "x x x x x",
        originalMetrics:   "U--U-",
        metricPatterns:    [{foot: "U--U-", durations: [0.5, 1, 1, 0.5, 1], accents: [0, 1, 1, 0, 1]}],
        durationTablature: [0.5, 1, 1, 0.5, 1],
        accentTablature:   [0, 1, 1, 0, 1],
        syllableCount:     5,
        footBoundaries:    [0],
    };

    const firstPaeon: ProcessedVerse = {
        text:              "x x x x",
        originalMetrics:   "-UUU",
        metricPatterns:    [{foot: "-UUU", durations: [1, 0.5, 0.5, 0.5], accents: [1, 0, 0, 0]}],
        durationTablature: [1, 0.5, 0.5, 0.5],
        accentTablature:   [1, 0, 0, 0],
        syllableCount:     4,
        footBoundaries:    [0],
    };

    it("applies a cycle modifier to every syllable of its matching parsed foot", () => {
        const track = createRhythmTrack(firstPaeon, "paeon_cretic_iamb");
        const notes = track.events
            .filter(event => event.type === "note_on")
            .map(event => event.data[0]);

        // The first-paeon modifier is an application-defined +3 semitones;
        // it applies to this actual -UUU foot, not only to positions that
        // happen to coincide with a raw syllable-count cycle.
        expect(notes).toEqual([63, 63, 63, 63]);
    });

    it("applies the dochmiac modifier to every syllable of a matching dochmiac foot", () => {
        const track = createRhythmTrack(dochmiac, "dochmiac_paeon_cretic");
        const notes = track.events
            .filter(event => event.type === "note_on")
            .map(event => event.data[0]);

        expect(notes).toEqual([62, 62, 62, 62, 62]);
    });

    it("leaves a parsed foot unchanged when it does not match the selected cycle", () => {
        const track = createRhythmTrack(firstPaeon, "dochmiac_paeon_cretic");
        const notes = track.events
            .filter(event => event.type === "note_on")
            .map(event => event.data[0]);

        expect(notes).toEqual([60, 60, 60, 60]);
    });
});

describe("MidiGeneratorService Sapphic/Aeolic line timing", () => {
    const sixEighthLine: ProcessedVerse = {
        text:              "x x x x",
        originalMetrics:   "-UUU",
        metricPatterns:    [{foot: "-UUU", durations: [1, 0.5, 0.5, 0.5], accents: [1, 0, 0, 0]}],
        durationTablature: [1, 0.5, 0.5, 0.5],
        accentTablature:   [1, 0, 0, 0],
        syllableCount:     4,
        footBoundaries:    [0],
        sapphicLinePosition: 0,
    } as ProcessedVerse;

    it("does not compress a 6/8 line through the hidden chronos base unit", () => {
        const track = createSapphicTrack(sixEighthLine);
        const noteOffs = track.events.filter(event => event.type === "note_off");

        // 6 eighths at the shared 480-tick reference equals 2,880 ticks.
        // The old accidental 280 ms chronos base produced only 1,613 ticks.
        expect(noteOffs[noteOffs.length - 1]?.time).toBe(2880);
    });

    it("keeps the third Sapphic/Alcaic line at the sourced 10/8 total", () => {
        const track = createSapphicTrack({...sixEighthLine, sapphicLinePosition: 2} as ProcessedVerse);
        const noteOffs = track.events.filter(event => event.type === "note_off");

        expect(noteOffs[noteOffs.length - 1]?.time).toBe(4800);
    });
});
