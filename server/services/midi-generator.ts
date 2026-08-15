// noinspection JSUnusedGlobalSymbols
// noinspection JSUnusedLocalSymbols

import 'dotenv/config';
import type {ProcessedVerse} from "./metrical-analysis";

export interface MidiTrack {
    channel: number;
    instrument: number;
    events: MidiEvent[];
}

export interface MidiEvent {
    type:
        | "note_on"
        | "note_off"
        | "program_change"
        | "tempo_change"
        | "pitch_bend";
    time: number;
    data: number[];
}

export interface GeneratedMusicFiles {
    midiBuffer: Buffer;
    musicXml: string;
}

/**
 * MidiGeneratorService - converts processed Ancient Greek verse
 * (ProcessedVerse: syllables, duration/accent tablature, metrical
 * structure - see ./metrical-analysis) into a multi-track MIDI file.
 *
 * Core architecture: Marcus Mota's three-layer methodology (Duration
 * Tablature, Accent Tablature, Vocal Guide) - see docs/PROVENANCE.md
 * and docs/PROVENANCE.md for full citations of every sourced claim in
 * this file. Verified vs speculative vs fixed-this-session status for
 * each feature lives in docs/PROVENANCE.md, not here - code comments
 * point to it rather than duplicating it.
 *
 * Live entry point for track generation: createTracks() - calls
 * createRhythmTrack(), createAccentTrack(), createVocalGuideTrack(),
 * and (for antiochene_scenic) createPantomimeTrack() /
 * createAntiphonalResponseTrack(). Per-note timing goes through
 * calculateNoteLength().
 */
export class MidiGeneratorService {
    private readonly rng: () => number;
    private experimental?: any;
    
    constructor(seed?: number) {
        if (seed !== undefined) {
            let state = seed;
            this.rng = () => {
                state = (
                            state * 1664525 + 1013904223
                        ) % 0x100000000;
                return state / 0x100000000;
            };
        } else {
            this.rng = Math.random;
        }
    }
    
    // Per-instrument citations below confirm each named instrument's
    // ancient attestation -- the GM patch NUMBERS themselves are modern
    // MIDI-standard choices with no possible ancient source (same
    // treatment as pantomimeInstruments' hydraulis/scabellum entries) --
    // this is documentation only, zero change to which patch plays.
    private readonly instruments = {
        // Double-reed pipe, extremely well-attested throughout this
        // project's sources (Aristotle Politics, Plato Republic,
        // Pseudo-Plutarch, Aristoxenus) -- see docs/PROVENANCE.md,
        // "Modal Tonoi/ethos" and "Ethos-instrument mapping."
        aulos: 69,
        // Pan-pipes; discussed in West, Ancient Greek Music.
        syrinx: 73,
        // The basic lyre; extremely well-attested across every source
        // this project has used.
        lyra: 46,
        // Professional concert lyre, distinct from the basic lyra --
        // attested in Ptolemy's Harmonics and Aristides Quintilianus
        // (both on hand).
        kithara: 24,
        // Early, Homeric-era form of lyre.
        phorminx: 46,
        // SPECULATIVE-adjacent: a three-stringed long-necked lute,
        // primarily a later Hellenistic/Roman-period and Eastern
        // instrument -- its status as a core "ancient Greek" instrument
        // (vs. a later import) has not been independently verified
        // against a primary source in this project.
        pandura: 24,
        // War-trumpet; military use attested in Aristotle and elsewhere.
        salpinx: 56,
        // Frame drum -- fully cited via Apuleius, Metamorphoses XI (on
        // hand) -- see docs/PROVENANCE.md's Apuleius entry.
        tympanon: 117,
        // Clappers; well-attested percussion instrument.
        krotala: 115,
        // Cymbals -- attested in Apuleius' Isis procession scene
        // (Metamorphoses XI, "crepitantia cymbala," on hand).
        kymbala: 49,
        // Egyptian rattle, directly attested in the same Apuleius Isis
        // procession scene as kymbala above (on hand).
        sistrum: 81,
        // Hand-drum/tambourine-type percussion -- not independently
        // verified against a primary source in this project.
        rhoptron: 76,
        // NOT VERIFIED: this name has not been confirmed as an attested
        // ancient Greek instrument term against any source checked in
        // this project -- flagged here rather than silently assumed.
        keraunoskopion: 51,
        // Not an instrument -- hand-clapping to mark rhythm is
        // well-attested generally (West, Ancient Greek Music, discusses
        // clapping/stomping as rhythm-marking practice) but doesn't need
        // an instrument-specific citation the way the entries above do.
        hand_clap_light:  39,
        hand_clap_strong: 39,
    };
    // dorian's lower tetrachord corrected [0,2,3,5] -> [0,1,3,5]
    // (semitone-tone-tone) to match Hagel's tense diatonic shade (p.153)
    // and the "Dorian type" convention in Weil & Reinach's De Musica
    // edition (smallest interval at the low end) - see docs/PROVENANCE.md,
    // "Genera: diatonic (Dorian)". Signed off before implementing; real
    // audio output change.
    // The other seven modes below are UNAUDITED against this same
    // question - they were not part of that sign-off and have not been
    // checked against Hagel or any other source. Don't assume they're
    // correct just because dorian was fixed.
    private readonly modes = {
        dorian:       [0, 1, 3, 5, 7, 9, 10],
        phrygian:     [0, 1, 3, 5, 7, 8, 10],
        lydian:       [0, 2, 4, 6, 7, 9, 11],
        mixolydian:   [0, 2, 4, 5, 7, 9, 10],
        aeolian:      [0, 2, 3, 5, 7, 8, 10],
        hypolydian:   [0, 2, 4, 5, 7, 8, 10],
        hypophrygian: [0, 1, 3, 5, 7, 8, 10],
        hypodorian:   [0, 2, 3, 5, 7, 8, 10],
    };
    // SOURCE: Ptolemy, Harmonics II.10–11 [62.16–65.15], trans. Jon
    // Solomon, pp.88–92. Ptolemy orders seven tonoi from high to low as
    // Mixolydian, Lydian, Phrygian, Dorian, Hypolydian, Hypophrygian,
    // Hypodorian, with adjacent leimma/tone/tone/leimma/tone/tone steps.
    // The cents are modern logarithmic renderings of Ptolemy's 256:243
    // leimma and 9:8 tone, not interval patterns attributed to the tonoi.
    // "none" deliberately leaves this optional historical layer inactive.
    private readonly ptolemaicTonosCents = {
        none:         0,
        mixolydian:   2 * 1200 * Math.log2(9 / 8) + 1200 * Math.log2(256 / 243),
        lydian:       2 * 1200 * Math.log2(9 / 8),
        phrygian:     1200 * Math.log2(9 / 8),
        dorian:       0,
        hypolydian:   -1200 * Math.log2(256 / 243),
        hypophrygian: -(
            1200 * Math.log2(256 / 243) + 1200 * Math.log2(9 / 8)
        ),
        hypodorian:   -(
            1200 * Math.log2(256 / 243) + 2 * 1200 * Math.log2(9 / 8)
        ),
    } as const;
    
    private getPtolemaicTonosAdjustment(tonos: string | undefined): {
        semitones: number;
        cents: number;
    } {
        const totalCents = this.ptolemaicTonosCents[
                               tonos as keyof typeof this.ptolemaicTonosCents
                               ] ?? 0;
        const semitones = Math.round(totalCents / 100);
        return {
            semitones,
            cents: totalCents - semitones * 100,
        };
    }
    
    // The pattern and name fields are checked against each parsed metrical
    // foot before an application-defined modifier is applied. West,
    // Introduction to Greek Metre (1987), pp.55-57, 66-67, documents
    // combination and transition among dramatic metrical units. It does not
    // attest either exact three-foot order, their use in Antioch, or these
    // MIDI values. The durations, effect, and articulation fields remain
    // descriptive metadata. See PROVENANCE, "Dramatic-metre modifier cycles."
    private readonly antiocheneRhythmicCells = {
        standard:              [
            {
                name:      "default",
                pattern:   "x x x x",
                durations: [1.0, 1.0, 1.0, 1.0],
                effect:    "neutral",
                emotion:   "neutral",
            },
        ],
        dochmiac_paeon_cretic: [
            {
                // West, Ancient Greek Music, p.142: dochmiac is "the equivalent of
                // eight short notes, divided unequally in groups of three and five.
                // The paradigm form is [short-long-long-short-long]." durations
                // [1,2,2,1,2] already encoded this shape correctly; the pattern
                // string previously read "UU-U-" (short-short-long-short-long),
                // inconsistent with its own durations array and with West's
                // paradigm -- corrected to "U--U-" here.
                pattern:   "U--U-",
                durations: [1, 2, 2, 1, 2],
                name:      "dochmiac",
                effect:    "παραλλαγή (parallagē)",
                emotion:   "passionate",
            },
            {
                // Paeon quartus (fourth paeon) = short-short-short-long, per West,
                // Ancient Greek Music, p.140-141 and Aristid. Quint. 1.15-17 (dactyl
                // 1:1, iambus 1:2, paeon 2:3). Previous durations [1.2,0.6,0.6,0.8]
                // / pattern "-UUU" encoded long-short-short-short -- that is paeon
                // primus, not paeon quartus -- mismatched to this entry's own
                // "fourth_paeon" name. Corrected to short-short-short-long here.
                pattern:   "UUU-",
                durations: [1, 1, 1, 2],
                name:      "fourth_paeon",
                effect:    "πομπικός (pompikos)",
                emotion:   "flowing",
            },
            {
                // Cretic = long-short-long, standard ratio 2:1:2 (Aristoxenos Rhythm.,
                // cf. West p.141 on the cretic/paeonic terminological overlap).
                // Previous durations [1.4,0.8,1.4] were the same shape,
                // directionally correct; tightened to the clean 2:1:2 ratio here.
                pattern:   "-U-",
                durations: [2, 1, 2],
                name:      "cretic",
                effect:    "σκηνικός (skēnikos)",
                emotion:   "solemn",
            },
        ],
        paeon_cretic_iamb:     [
            {
                // Paeon primus (first paeon) = long-short-short-short, per West,
                // Ancient Greek Music, p.140-141 and Aristid. Quint. 1.15-17.
                // Previous durations [0.9,0.7,0.7,1.7] / pattern "UUU-" encoded
                // short-short-short-long -- that is paeon quartus, not paeon
                // primus -- mismatched to this entry's own "first_paeon" name.
                // Corrected to long-short-short-short here.
                pattern:      "-UUU",
                durations:    [2, 1, 1, 1],
                name:         "first_paeon",
                effect:       "δρόμιος (dromios)",
                articulation: "staccato",
                emotion:      "ascending",
            },
            {
                // Cretic = long-short-long, standard ratio 2:1:2 (see the
                // dochmiac_paeon_cretic cretic entry above for the same citation).
                // Previous durations [1.8,0.6,1.6] were the same shape,
                // directionally correct; tightened to the clean 2:1:2 ratio here.
                pattern:      "-U-",
                durations:    [2, 1, 2],
                name:         "cretic",
                effect:       "βάσιμος (basimos)",
                articulation: "tenuto",
                emotion:      "balanced",
            },
            {
                // Iamb = short-long, standard ratio 1:2 (Aristid. Quint. 1.15-17,
                // "iambus = 1:2"). Previous durations [0.6,1.4] were the same
                // shape, directionally correct; tightened to the clean 1:2 ratio
                // here.
                pattern:      "U-",
                durations:    [1, 2],
                name:         "iamb",
                effect:       "ἀναπαιστικός (anapaistikos)",
                articulation: "marcato",
                emotion:      "rising",
            },
        ],
    };
    
    private readonly pythagoreanCache = new Map<string, number>();
    private readonly pythagoreanRatios = (
        () => {
            const ratios = new Map<number, number>();
            const commaRatio = Math.pow(2,
                                        -23.46 / 1200);
            for (let fifths = -12; fifths <= 12; fifths++) {
                const cycles = Math.trunc(fifths / 12);
                const rawRatio = Math.pow(3 / 2,
                                          fifths);
                const correctedRatio = rawRatio * Math.pow(commaRatio,
                                                           cycles);
                ratios.set(fifths,
                           correctedRatio);
            }
            return ratios;
        }
    )();
    
    private calculatePythagoreanFrequency(
        baseFreq: number,
        fifthsFromBase: number,
    ): number {
        const cacheKey = `${baseFreq}-${fifthsFromBase}`;
        if (this.pythagoreanCache.has(cacheKey)) {
            return this.pythagoreanCache.get(cacheKey)!;
        }
        let ratioFifth: number;
        if (this.pythagoreanRatios.has(fifthsFromBase)) {
            ratioFifth = this.pythagoreanRatios.get(fifthsFromBase)!;
        } else {
            const cycles = Math.trunc(fifthsFromBase / 12);
            const remainder = fifthsFromBase % 12;
            const rawRatio = Math.pow(3 / 2,
                                      fifthsFromBase);
            const commaRatio = Math.pow(2,
                                        -23.46 / 1200);
            ratioFifth = rawRatio * Math.pow(commaRatio,
                                             cycles);
        }
        let freq = baseFreq * ratioFifth;
        const baseFreq2 = baseFreq * 2;
        while (freq >= baseFreq2) freq *= 0.5;
        while (freq < baseFreq) freq *= 2;
        this.pythagoreanCache.set(cacheKey,
                                  freq);
        return freq;
    }
    
    // DEAD CODE - superseded by frequencyToMidiNoteAndCents() below (cached,
    // faster log2). Kept per project policy, not called anywhere live.
    private frequencyToMidiNoteAndCents_OLD(freq: number): {
        midiNote: number;
        centsOffset: number;
    } {
        const midiFloat = 69 + 12 * Math.log2(freq / 440);
        const midiNote = Math.round(midiFloat);
        const centsOffset = (
                                midiFloat - midiNote
                            ) * 100;
        return {
            midiNote,
            centsOffset,
        };
    }
    
    private readonly midiConversionCache = new Map<
        number,
        { midiNote: number; centsOffset: number }
    >();
    
    private readonly log2Constant = 1 / Math.LN2;
    
    // SOURCE: none - standard A440/12-TET reference math, not
    // classical-source-specific (used regardless of ancient vs modern
    // tuning system selected elsewhere).
    // Converts a raw frequency (Hz) to the nearest MIDI note number plus the
    // remaining pitch offset in cents (for pitch-bend). A9 = 440Hz = MIDI 69
    // is the standard reference. Used by every tuning system that computes
    // real frequencies (Pythagorean scale, Archytas enharmonic) rather than
    // working in MIDI semitones directly.
    private frequencyToMidiNoteAndCents(freq: number): {
        midiNote: number;
        centsOffset: number;
    } {
        const roundedFreq = Math.round(freq * 100) / 100;
        if (this.midiConversionCache.has(roundedFreq)) {
            return this.midiConversionCache.get(roundedFreq)!;
        }
        const midiFloat = 69 + 12 * Math.log(freq / 440) * this.log2Constant;
        const midiNote = Math.round(midiFloat);
        const centsOffset = (
                                midiFloat - midiNote
                            ) * 100;
        const result = {
            midiNote,
            centsOffset,
        };
        this.midiConversionCache.set(roundedFreq,
                                     result);
        return result;
    }
    
    // DEAD CODE - superseded by centsToPitchBend() below (no exception
    // thrown on edge cases, small-value fast path). Not called anywhere live.
    private centsToPitchBend_OLD(cents: number): number {
        const pitchBendRangeCents = this.experimental?.pitchBendRange || 200;
        if (pitchBendRangeCents <= 0) {
            throw new Error("Pitch bend range must be positive");
        }
        const pitchBendCenter = 8192;
        const pitchBendValue = Math.round(
            pitchBendCenter + (
                                cents / pitchBendRangeCents
                            ) * pitchBendCenter,
        );
        return Math.max(0,
                        Math.min(16383,
                                 pitchBendValue));
    }
    
    // SOURCE: none - MIDI protocol pitch-bend encoding (14-bit, center
    // 8192), not classical-source-specific.
    // Converts a cents deviation to a 14-bit MIDI pitch-bend value (0-16383,
    // center=8192, no bend). Range is configurable via
    // experimental.pitchBendRange (default +-200 cents). Used everywhere a
    // microtonal deviation (Archytas enharmonic, Pythagorean comma-drift
    // beyond 12-TET) needs to be expressed as an actual MIDI event.
    private centsToPitchBend(cents: number): number {
        const pitchBendRangeCents = this.experimental?.pitchBendRange || 200;
        if (Math.abs(cents) < 0.01) return 8192;
        const pitchBendCenter = 8192;
        const bendRatio = cents / pitchBendRangeCents;
        const pitchBendValue = pitchBendCenter + bendRatio * pitchBendCenter;
        return pitchBendValue < 0
               ? 0
               : pitchBendValue > 16383
                 ? 16383
                 : Math.round(pitchBendValue);
    }
    
    // SOURCE: Pythagorean tuning tradition (3:2 fifths) - see
    // docs/PROVENANCE.md, "Tuning: Pythagorean fifths" (comma math
    // verified exact; comma-smoothing flagged as a modern convenience).
    // Builds a full mode scale (7 MIDI notes) using real Pythagorean 3:2
    // fifths instead of 12-TET semitones. fifthsMap converts each mode
    // degree's semitone offset into "how many fifths from C" (the circle-
    // of-fifths position), then calculatePythagoreanFrequency() does the
    // actual tuning math - see docs/PROVENANCE.md, Tuning section, for
    // the verified comma math and the honest caveat about comma-smoothing.
    private generatePythagoreanScale(
        baseNote: number,
        mode: keyof typeof this.modes,
        baseFreq: number = 261.63,
    ): number[] {
        const cacheKey = `${baseNote}-${mode}-${baseFreq}`;
        if (this.pythagoreanCache.has(cacheKey)) {
            return JSON.parse(this.pythagoreanCache.get(cacheKey)! as any);
        }
        const modePattern = this.modes[mode];
        const scale: number[] = [];
        const fifthsMap: readonly number[] = [
            0, -5, 2, -3, 4, -1, 6, 1, -4, 3, -2, 5,
        ];
        for (const semitone of modePattern) {
            const fifthsFromC = fifthsMap[semitone] || 0;
            const freq = this.calculatePythagoreanFrequency(baseFreq,
                                                            fifthsFromC);
            const { midiNote } = this.frequencyToMidiNoteAndCents(freq);
            scale.push(midiNote);
        }
        this.pythagoreanCache.set(cacheKey,
                                  JSON.stringify(scale) as any);
        return scale;
    }
    
    // @deprecated - DEAD CODE - never called. Fixed to match Hagel p.153 (see
    // docs/PROVENANCE.md, "Genera: chromatic pyknon") - diatonic and chromatic.
    // Left for reference (see relevant TODO item).
    private generateTetrachordNote_OLD(
        index: number,
        scale: number[],
        baseNote: number,
        genus: string = "diatonic",
    ): number {
        // Fixed to match Hagel p.153 (see docs/PROVENANCE.md, "Genera:
        // chromatic pyknon"): diatonic was tone-tone-semitone (reverse of
        // tense diatonic's semitone-tone-tone); chromatic was identical to
        // tense diatonic's pattern, matching no chromatic shade at all.
        // enharmonic was already correct (Aristoxenus' own, 50+50+400c),
        // unchanged. Dead code (zero live callers) -- fixed for consistency
        // per project policy, not because this affects any live output.
        const tetrachordPatterns = {
            diatonic:   [0, 1, 3, 5],
            chromatic:  [0, 1, 2, 5],
            enharmonic: [0, 0.5, 1, 5],
        };
        const pattern =
                  tetrachordPatterns[genus as keyof typeof tetrachordPatterns] ||
                  tetrachordPatterns.diatonic;
        const tetrachordIndex = index % 4;
        const tetrachordNumber = Math.floor(index / 4);
        let note = baseNote + Math.round(pattern[tetrachordIndex] * 100) / 100;
        if (tetrachordNumber > 0) {
            const isDisjunct = tetrachordNumber % 2 === 1;
            const separation = isDisjunct ? 6 : 5;
            note += tetrachordNumber * separation;
        }
        return Math.round(note);
    }
    
    private readonly tetrachordCache = new Map<string, number>();
    // Same table, same fix, as the copy inside generateTetrachordNote_OLD()
    // above -- see that copy's comment for the full citation detail. Both
    // copies must be edited identically per project policy on duplicated
    // logic (docs/HANDOFF.md).
    private readonly tetrachordPatterns = {
        diatonic:   [0, 1, 3, 5] as const,
        chromatic:  [0, 1, 2, 5] as const,
        enharmonic: [0, 0.5, 1, 5] as const,
    } as const;
    
    // @deprecated - DEAD CODE - never called. Fixed to match Hagel p.153 (see
    // docs/PROVENANCE.md, "Genera: chromatic pyknon") - diatonic and chromatic.
    // Left for reference (see relevant TODO item).
    private generateTetrachordNote(
        index: number,
        scale: number[],
        baseNote: number,
        genus: string = "diatonic",
    ): number {
        const cacheKey = `${index}-${baseNote}-${genus}`;
        if (this.tetrachordCache.has(cacheKey)) {
            return this.tetrachordCache.get(cacheKey)!;
        }
        const pattern =
                  this.tetrachordPatterns[genus as keyof typeof this.tetrachordPatterns] ||
                  this.tetrachordPatterns.diatonic;
        const tetrachordIndex = index & 3;
        const tetrachordNumber = index >> 2;
        let note = baseNote + Math.round(pattern[tetrachordIndex] * 100) / 100;
        if (tetrachordNumber > 0) {
            const isDisjunct = (
                                   tetrachordNumber & 1
                               ) === 1;
            const separation = isDisjunct ? 6 : 5;
            note += tetrachordNumber * separation;
        }
        const result = Math.round(note);
        this.tetrachordCache.set(cacheKey,
                                 result);
        return result;
    }
    
    // SOURCE: none directly - a lookup-table restatement of the circle of
    // fifths (basic music theory), in support of the sourced Pythagorean
    // calculation above.
    // Circle-of-fifths lookup: given a semitone offset from C (0-11),
    // returns how many fifths up/down from C that note sits at in
    // Pythagorean tuning. Same table as generatePythagoreanScale's inline
    // fifthsMap, kept separately here for callers that only have a raw
    // semitone value.
    private getFifthsFromC(semitoneFromC: number): number {
        const fifthsMap: Record<number, number> = {
            0:  0,
            1:  -5,
            2:  2,
            3:  -3,
            4:  4,
            5:  -1,
            6:  6,
            7:  1,
            8:  -4,
            9:  3,
            10: -2,
            11: 5,
        };
        const normalizedSemitone = (
                                       (
                                           semitoneFromC % 12
                                       ) + 12
                                   ) % 12;
        return fifthsMap[normalizedSemitone] || 0;
    }
    
    // SOURCE: standard classical-metrics foot nomenclature (dactyl, iamb,
    // etc.) - general prosody, not tied to one specific ancient citation.
    // The "X"/anceps handling specifically traces to Aristoxenus' irrational
    // khoreios - see isAnceps() below.
    // Identifies which named metrical foot (if any) starts at `index` in a
    // duration sequence, by pattern-matching against every standard foot
    // shape (1.0=long, 0.5=short, "X"=anceps/either). Returns the foot name
    // or null if nothing matches. "X" entries are checked via isAnceps()
    // below rather than an exact value match.
    private matchFootAtIndex(durations: number[], index: number): string | null {
        const metricalFeet: Record<string, (number | "X")[]> = {
            dactyl:     [1.0, 0.5, 0.5],
            anapest:    [0.5, 0.5, 1.0],
            iamb:       [0.5, 1.0],
            trochee:    [1.0, 0.5],
            spondee:    [1.0, 1.0],
            amphibrach: [0.5, 1.0, 0.5],
            cretic:     [1.0, 0.5, 1.0],
            tribrach:   [0.5, 0.5, 0.5],
            molossus:   [1.0, 1.0, 1.0],
            // This table is reached only through unused
            // computeFootStructure(). Kept consistent with the live table's
            // primary shape (server/services/metrical-analysis.ts,
            // metricalPatterns["U--U-"]) per project policy.
            // The live table also has a second, coexisting dochmiac shape
            // ("U---U") this single-entry structure can't represent (one
            // key per foot name here, not per pattern-shape).
            dochmiac:       [0.5, 1.0, 1.0, 0.5, 1.0],
            proceleusmatic: [0.5, 0.5, 0.5, 0.5],
            first_paeon:    [1.0, 0.5, 0.5, 0.5],
            second_paeon:   [0.5, 1.0, 0.5, 0.5],
            third_paeon:    [0.5, 0.5, 1.0, 0.5],
            fourth_paeon:   [0.5, 0.5, 0.5, 1.0],
            choriamb:       [1.0, 0.5, 0.5, 1.0],
            ionic_a_minore: [0.5, 0.5, 1.0, 1.0],
            ionic_a_maiore: [1.0, 1.0, 0.5, 0.5],
            // Added to match footRatios/PROVENANCE.md - previously
            // present in footRatios (dead code, never reached this
            // table) but absent here, where matching actually happens.
            // Unit conversion: footRatios 1=short/2=long -> this
            // table's 0.5=short/1.0=long.
            epitrite_1:            [0.5, 1.0, 1.0, 1.0],
            epitrite_2:            [1.0, 0.5, 1.0, 1.0],
            epitrite_3:            [1.0, 1.0, 0.5, 1.0],
            epitrite_4:            [1.0, 1.0, 1.0, 0.5],
            bacchius:              [0.5, 1.0, 1.0],
            antibacchius:          [1.0, 1.0, 0.5],
            palimbacchius:         [1.0, 0.5, 1.0],
            bacchius_rhythmical_1: [0.5, 1.0, 1.0, 0.5],
            bacchius_rhythmical_2: [1.0, 0.5, 0.5, 1.0],
            binding_1:             [1.0, 0.5, 1.0, "X"],
            x_u_:                  ["X", 0.5, 1.0],
            u_x:                   [0.5, "X"],
            x_:                    ["X"],
            long_single:           [1.0],
            short_single:          [0.5],
            anceps_single:         ["X"],
        };
        for (const [name, pattern] of Object.entries(metricalFeet)) {
            const slice = durations.slice(index,
                                          index + pattern.length);
            if (slice.length < pattern.length) continue;
            const isMatch = pattern.every((val, i) => {
                const dur = slice[i];
                if (val === "X") return this.isAnceps(dur);
                return Math.abs(dur - val) < 0.25;
            });
            if (isMatch) return name;
        }
        return null;
    }
    
    // SOURCE: Aristoxenus, Elementa Rhythmica II.20 (Marchetti trans.,
    // p.71-72) on the "irrational khoreios" - see docs/PROVENANCE.md.
    // Lynch's 2020 chapter glosses Aristoxenus' own construction:
    // comparing a downbeat-2 foot's upbeat across the equal (upbeat 2),
    // double (upbeat 1), and irrational (upbeat "intermediate between the
    // previous two", i.e. 1.5) feet.
    // A duration counts as "anceps" (either long or short) if it falls
    // anywhere in [0.5, 1.5] - i.e. covers both the short (0.5) and long
    // (1.0) canonical values plus the irrational/intermediate value
    // (Aristoxenus' own construction, ~1.5 - see citation above).
    private isAnceps(value: number): boolean {
        return value >= 0.5 && value <= 1.5;
    }
    
    // SOURCE: none directly cited - a heuristic classifier, not itself
    // quoting a specific Aristoxenus passage despite the name. Uses the
    // same standard foot nomenclature as matchFootAtIndex above.
    // Heuristic foot-classifier used where matchFootAtIndex's exact pattern
    // match is too strict: looks at the current duration and up to two
    // syllables ahead to guess dactyl/anapaest/spondee/etc. by shape
    // (long-short-short vs short-short-long vs long-long, and so on).
    private determineAristoxenianFoot(verse: any, index: number): string {
        const durations = verse.durationTablature;
        const current = durations[index] || 1.0;
        const next = durations[index + 1];
        const next2 = durations[index + 2];
        if (current > 1.0) {
            if (next && next <= 1.0) {
                if (next2 && next2 <= 1.0) {
                    return "dactyl";
                }
                return "trochee";
            } else if (next && next > 1.0) {
                return "spondee";
            }
            return "trochee";
        } else {
            if (next && next > 1.0) {
                if (next2 && next2 <= 1.0) {
                    return "amphibrach";
                }
                return "iamb";
            } else if (next && next <= 1.0) {
                if (next2 && next2 > 1.0) {
                    return "anapest";
                }
                return "pyrrhic";
            }
            return "iamb";
        }
    }
    
    private getPercussionNote(instrument: string): number {
        const percussionMap: Record<string, number> = {
            tympanon:         47,
            krotala:          75,
            kymbala:          49,
            sistrum:          81,
            rhoptron:         76,
            keraunoskopion:   51,
            hand_clap_light:  39,
            hand_clap_strong: 40,
        };
        return percussionMap[instrument] || 36;
    }
    
    // SOURCE: Lynch, Tosca A. C., "Arsis and Thesis in Ancient Rhythmics
    // and Metrics: A New Approach," CQ 66.2 (2016), 491-513; full primary
    // text on hand and directly consulted. Confirmed by Martianus Capella,
    // De Nupt. 974 ("arsis est elatio, thesis depositio uocis ac
    // remissio"). See docs/PROVENANCE.md, "Thesis/Arsis marking."
    // Direction (arsis higher, thesis lower) is directly sourced, built
    // from Aristides Quintilianus, Herophilus/Galen, and the Aristotelian
    // Problems -- Lynch's argument is specifically against dynamic/volume
    // accent, replacing it with melodic (pitch) accent. TWO THINGS BELOW
    // ARE NOT THEMSELVES SOURCED, only the direction is: (1) the specific
    // ~1-semitone magnitude -- Lynch gives direction only, never a number;
    // (2) the flat duration weight below -- Lynch's paper touches duration
    // only via a modern music-psychology citation motivating why pitch is
    // worth investigating, not an ancient-evidence claim that thesis gets
    // no extra duration. Both are this project's own reasonable choices,
    // consistent with her argument but not asserted by it.
    private getArsisThesisPitchLynch(
        isArsis: boolean,
        isThesis: boolean,
    ): number {
        return isArsis ? 61 : isThesis ? 59 : 60;
    }
    
    private getArsisThesisVelocityLynch(footAccent: number): number {
        // Arsis/thesis marks do not select velocity. This value reflects the
        // independently calculated metrical accent for the current foot.
        return Math.min(118,
                        95 + footAccent * 11);
    }
    
    // Flat by design -- see the SOURCE comment on getArsisThesisPitchLynch
    // above for the full citation; this function's specific claim (no
    // additional duration weighting) is this project's own implementation
    // choice, not itself asserted by Lynch -- see docs/PROVENANCE.md,
    // Thesis/Arsis marking, point 2, for the full distinction.
    private getArsisThesisDurationWeightLynch(): number {
        return 1.0;
    }
    
    // The melody path adds a semitone-scale pitch adjustment on top of the
    // selected scale degree.
    private getArsisThesisPitchAdjustLynch(
        isArsis: boolean,
        isThesis: boolean,
    ): number {
        return isArsis ? 1 : isThesis ? -1 : 0;
    }
    
    // This call site uses its own metrical-accent clamp range. As above,
    // velocity depends on the metrical accent rather than the arsis/thesis
    // mark.
    private getArsisThesisVelocityLynchB(accentValue: number): number {
        return Math.min(120,
                        Math.max(80,
                                 Math.round(95 + accentValue * 12)));
    }
    
    private calculateNoteLength(
        duration: number,
        index: number,
        verse: any,
        experimental?: any,
        allowMelody?: boolean,
    ): number {
        let length: number;
        if (allowMelody) {
            const melodicVariation = 1 + Math.sin(index * 0.3) * 0.1;
            duration = duration * melodicVariation;
        }
        
        let metricalWeight = 1.0;
        let weightedDuration: number; // Declare it outside both blocks
        // Arsis/thesis duration remains unweighted (Lynch 2016, CQ 66.2,
        // 492-4; see docs/PROVENANCE.md). Marks do not select velocity here.
        
        if (verse.arsisThesisPattern) {
            //if (verse.acuteAccentTablature?.[index]) {
            // Acute-accent override is disabled.
            //metricalWeight = 1.3; // Acute = strongest emphasis
            //} else
            metricalWeight = this.getArsisThesisDurationWeightLynch();
            
            // Apply metricalWeight to the base duration, don't replace it
            const baseDuration = verse.durationTablature[index] ?? 1.0; // Preserve U (0.5) vs - (1.0)
            weightedDuration = baseDuration * metricalWeight; // Apply arsis-thesis on top
        } else {
            weightedDuration = duration * metricalWeight;
        }
        
        if (experimental?.rhythmModel === "chronos_ratios") {
            // FIXED: this block previously only ran when verse.arsisThesisPattern
            // was set, silently falling through to a generic proportional scale
            // otherwise -- meaning chronos_ratios' actual Aristoxenian-sourced
            // logic (below) did nothing different from a plain duration scale
            // for any verse without arsis/thesis marking. Per explicit standing
            // instruction (Aristoxenian foot-time applies everywhere unless a
            // specific case is shown not to be historically backed -- no such
            // case was shown here), that gate is removed: this logic now always
            // runs. The arsis/thesis composite multiplier below (`weighted`)
            // still naturally does nothing extra when no arsisThesisPattern is
            // present, since weightedDuration reduces to plain duration*1.0 in
            // that case -- so this is a strict widening, not a change to
            // arsis/thesis-marked output.
            const chronosProttos = experimental?.baseUnit || 450;
            // durationTablature is the live long/short source: 0.5 is short
            // and 1.0 is long. It supplies the 1:2 chronos relation below.
            const rawDur = verse.durationTablature?.[index] ?? 1.0;
            const metrical = rawDur >= 1.0 ? "-" : "U";
            // SOURCE: Aristoxenus, Elementa Rhythmica II.30 (Marchetti trans., p.74;
            // see docs/PROVENANCE.md) for the base
            // long:short = 2:1 ("double"/iambic genus) ratio below.
            let chronosRatio: number;
            if (metrical == "-") {
                chronosRatio = 2.0;
            } else if (metrical == "U") {
                chronosRatio = 1.0;
            } else {
                chronosRatio = 1.0;
            }
            // Apply the selected arsis/thesis duration model directly to the
            // already-established Aristoxenian ratio. Both models return 1.0,
            // so arsis/thesis does not change tempo.
            chronosRatio *= metricalWeight;
            // SOURCE: Aristoxenus, Elementa Rhythmica §§10, 16–20
            // (Marchetti trans., pp.68–71; docs/PROVENANCE.md): a foot's
            // arsis/thesis markers are primary-time multiples. Chronos keeps
            // the selected long/short value unchanged at a foot boundary.
            // SPECULATIVE: unequal multipliers (1.2x long / 0.95x short) shift the
            // cited 2:1 ratio above to ~2.53:1 when this flag is on. No ancient
            // source found for this specific tempo adjustment - behavior unchanged
            // pending a decision on what to do with it.
            let tempoModifier = 1.0;
            if (experimental?.aristoxenianTempo) {
                if (["-", "U"].includes(metrical)) {
                    tempoModifier = metrical === "-" ? 1.2 : 0.95;
                }
            }
            const finalChronosCount = chronosRatio * tempoModifier;
            const milliseconds = finalChronosCount * chronosProttos;
            length = Math.round((
                                    milliseconds / 500
                                ) * 480);
            length = Math.max(120,
                              length);
        } else if (experimental?.rhythmModel === "heraclitean_pulse") {
            // SPECULATIVE: no source found for this variability formula. UI label
            // ("later theoretical construct") already signals non-primary-source;
            // this comment makes that explicit at the implementation site too -
            // see docs/PROVENANCE.md, "Creative / algorithmic features."
            const baseUnit = experimental?.baseUnit || 260;
            const variability = Math.sin(index * 0.7) * 0.15;
            const adjusted = weightedDuration * (
                1 + variability
            );
            length = Math.round((
                                    (
                                        adjusted * baseUnit
                                    ) / 250
                                ) * 480);
        } else if (experimental?.rhythmModel === "euripidean_flow") {
            // INTERPRETIVE: West, Ancient Greek Music (1992), pp.142–144,
            // identifies dochmiac as characteristic of tragedy, used in urgent
            // or emotional contexts, with fluctuation between dochmiac and other
            // measures and changes of bar-length. West does not prescribe these
            // five numeric multipliers; they are this application's creative
            // timing realization, not a Euripidean reconstruction. See
            // docs/PROVENANCE.md, "Creative / algorithmic features."
            const baseUnit = experimental?.baseUnit || 240;
            const dochmiacModifiers = [0.95, 1.15, 0.85, 1.1, 1.0];
            const modifier = dochmiacModifiers[index % dochmiacModifiers.length];
            const adjusted = weightedDuration * modifier;
            length = Math.round((
                                    (
                                        adjusted * baseUnit
                                    ) / 250
                                ) * 480);
        } else if (experimental?.rhythmModel === "delphic_paean") {
            // Canonical Classical-period paeonic note-patterns (West, Ancient Greek
            // Music, pp.140-141): "normally expressed in the note-patterns [long +
            // 3 shorts] and [3 shorts + long]" -- quintuple (5-unit) time, thesis:
            // arsis in a 2:3 ratio (West p.140; Aristid. Quint. 1.15-17, p.35.3ff,
            // cited in West's own n.7 alongside Aristotle Rh. 1409a4 and Aristox.
            // Rhythm. 2.30 Pearson). Pattern 1 = paeon primus (long-short-short-
            // short); Pattern 2 = paeon quartus (short-short-short-long). West's
            // "rarely" third variant (short-long-short-short) is not included here.
            // SPECULATIVE: neither West nor the cited ancient sources prescribe
            // the +/-5% per-note jitter or the every-32-notes pause below;
            // these are this application's expressive additions. See
            // docs/PROVENANCE.md, "Rhythm: Delphic paeonic patterns."
            const authenticDelphicPatterns = [
                [2, 1, 1, 1],
                [1, 1, 1, 2],
            ];
            const baseUnit = 400;
            const patternIndex =
                      Math.floor(index / 16) % authenticDelphicPatterns.length;
            const currentPattern = authenticDelphicPatterns[patternIndex];
            const position = index % currentPattern.length;
            const varied = currentPattern[position] * (
                0.95 + this.rng() * 0.1
            );
            length = Math.round(varied * baseUnit);
            if (index > 0 && index % 32 === 0) {
                length += 480;
            }
        } else if (experimental?.rhythmModel === "sapphic_lyric") {
            // SOURCE: West, Ancient Greek Music (1992), pp.148–150,
            // Examples 5.11–5.15. Two matching Sapphic/Alcaic lines occupy
            // 6/8; the third occupies 10/8 through impaction of two 6/8
            // bar-types. The source supports those line totals, not a
            // universal per-syllable duration array. Existing long/short
            // values distribute each cited line total proportionally. The
            // input has no stanza labels, so createTracks assigns consecutive
            // verses to a repeating 6/8, 6/8, 10/8 cycle for this explicit
            // model. West, Introduction to Greek Metre (1987), pp.33–35,
            // independently supports the aaA stanza shape.
            // `baseUnit` belongs to the user-adjustable chronos_ratios
            // model. The Sapphic control exposes no such timing parameter;
            // borrowing the application's default 280 ms here compressed a
            // cited 6/8 line to 56% of the generator's 500 ms reference
            // unit and made this model audibly race. Keep the 6/8–6/8–10/8
            // relationship, but use the common MIDI reference unit.
            const referenceUnitMilliseconds = 500;
            const lineEighths = verse.sapphicLinePosition === 2 ? 10 : 6;
            const lineUnits = (
                              verse.durationTablature || []
                              ).reduce(
                (sum: number, value: number) => sum + (
                    value >= 1.0 ? 2 : 1
                ),
                0,
            ) || 1;
            const syllableUnits = duration >= 1.0 ? 2 : 1;
            const syllableEighths = lineEighths * syllableUnits / lineUnits;
            length = Math.round(
                syllableEighths * referenceUnitMilliseconds / 500 * 480,
            );
        } else if (experimental?.rhythmModel === "nomos_apollonian") {
            // QUALITATIVE FIVE-SECTION STRUCTURE, explicitly interpretive --
            // NOT sourced numeric ratios. The Pythikos Nomos (Sakadas of
            // Argos, 586 BCE) is a real five-part programmatic aulos piece
            // depicting Apollo's battle with the Python (Strabo, Geography
            // IX.3.10; Pollux, Onomastikon IV.84; West, Ancient Greek Music,
            // pp.212-213; see PROVENANCE, "Rhythm: nomos_apollonian
            // five-section structure"). No source found --
            // not Strabo, not Pollux, not West -- gives numeric rhythmic
            // ratios or durations for any of the five sections; West is
            // explicit that "our sources do not altogether agree on the
            // details." What follows is this project's own realization of
            // West's descriptive content into distinct tempo/duration
            // character per section, in Pollux's order and naming (the
            // order West follows):
            //
            // UI wiring confirmed already correct, no change needed: this
            // rhythmModel is already in shared/schema.ts's Zod enum and in
            // experimental-panel.tsx's rhythmModels dropdown labels
            // ("Nomos performance structure (multisectional)") -- that
            // label predates this change and was already accurate.
            const totalNotes = verse.durationTablature?.length || 1;
            const sectionIndex = Math.min(4,
                                          Math.floor((
                                                         index / totalNotes
                                                     ) * 5));
            const baseUnit = experimental?.baseUnit || 320;
            let ratio: number;
            if (sectionIndex === 0) {
                // 1. Peira ("trying out") -- West p.213: "Apollo surveys the
                // ground to see if it is suitable for the struggle."
                // Tentative/exploratory -- deliberate, slightly elongated.
                ratio = 1.15;
            } else if (sectionIndex === 1) {
                // 2. Katakeleusmos ("call of command") -- West p.213: "he
                // challenges the serpent." Building intensity toward the
                // confrontation -- linear acceleration across the section.
                const sectionProgress =
                          (
                              (
                                  index / totalNotes
                              ) * 5
                          ) - 1;
                ratio = 1.1 - (
                    Math.max(0,
                             Math.min(1,
                                      sectionProgress)) * 0.2
                );
            } else if (sectionIndex === 2) {
                // 3. Iambikon ("the fight") -- West p.213: includes a
                // specifically documented aulos playing technique, "tooth
                // action" (reed pushed against the teeth, imitating the
                // serpent gnashing its teeth; Poll. 4.80, Hesychius). Tied
                // to the already-sourced Aristoxenian iambic genus ratio
                // (double ratio, 2:1 -- Aristoxenus, Elementa Rhythmica
                // II.30, see docs/PROVENANCE.md, "Rhythm: Aristoxenian genus
                // ratios") rather than an invented number: short-long
                // alternation at that ratio, giving a combative, uneven
                // texture standing in for the documented gnashing technique.
                ratio = (
                            index % 2 === 0
                        ) ? 0.6 : 1.2;
            } else if (sectionIndex === 3) {
                // 4. Spondeion -- West p.213: "the stately libation music
                // symbolizing the god's victory." Slow and solemn,
                // consistent with West's own gloss (not a separate claim
                // about the spondaic rhythmic genus, which is not verified
                // against a primary source here).
                ratio = 1.7;
            } else {
                // 5. Katachoreusis ("joyful dance") -- West p.213: "a joyful
                // dance of celebration." Fast, light.
                ratio = 0.65;
            }
            length = Math.round((
                                    (
                                        weightedDuration * ratio * baseUnit
                                    ) / 250
                                ) * 480);
        } else if (experimental?.rhythmModel === "antiochene_scenic") {
            // APPLICATION CHOICE: this baseUnit-scaled duration drives the
            // Antiochene listening model but is not an ancient timing value.
            // See PROVENANCE, "Antiochene scenic listening model: evidence
            // and limits."
            const baseUnit = experimental?.baseUnit || 260;
            length = Math.round((
                                    (
                                        weightedDuration * baseUnit
                                    ) / 250
                                ) * 480);
        } else {
            length = Math.round(weightedDuration * 480);
        }
        return Math.max(120,
                        length);
    }
    
    // SOURCE: none directly - orchestration/infrastructure. Delegates to
    // sourced logic throughout (see docs/PROVENANCE.md for what's
    // actually cited at each layer).
    // PUBLIC API ENTRY POINT - this is what callers outside this class
    // actually invoke (see server/routes.ts). Orchestrates the whole
    // pipeline: build all tracks (createTracks), then assemble them into a
    // real binary MIDI file (assembleMidiFile). `experimental` carries every
    // rhythmModel/genus/tuningSystem/etc. setting
    // from the request - see client/src/components/experimental-panel.tsx
    // for what a caller can actually set.
    generate(
        processedVerses: ProcessedVerse[],
        instrument: keyof typeof this.instruments,
        tempo: number                 = 120,
        mode: keyof typeof this.modes = "dorian",
        includeMetronome: boolean     = !1,
        experimental?: any,
        includeAccentTrack: boolean   = !1,
        includeVocalGuide: boolean    = !1,
        allowMelody: boolean          = !1,
    ): Buffer {
        this.experimental = experimental;
        const tracks = this.createTracks(
            processedVerses,
            instrument,
            tempo,
            mode,
            includeMetronome,
            experimental,
            includeAccentTrack,
            includeVocalGuide,
            allowMelody,
        );
        return this.assembleMidiFile(tracks,
                                     tempo);
    }
    
    // Application notation export only: MusicXML represents the generated
    // primary track's MIDI pitches and durations, not ancient Greek notation
    // or a scholarly transcription. Auxiliary click/accent tracks are not
    // score parts.
    generateWithMusicXml(
        processedVerses: ProcessedVerse[],
        instrument: keyof typeof this.instruments,
        tempo: number                 = 120,
        mode: keyof typeof this.modes = "dorian",
        includeMetronome: boolean     = !1,
        experimental?: any,
        includeAccentTrack: boolean   = !1,
        includeVocalGuide: boolean    = !1,
        allowMelody: boolean          = !1,
    ): GeneratedMusicFiles {
        this.experimental = experimental;
        const tracks = this.createTracks(
            processedVerses,
            instrument,
            tempo,
            mode,
            includeMetronome,
            experimental,
            includeAccentTrack,
            includeVocalGuide,
            allowMelody,
        );
        return {
            midiBuffer: this.assembleMidiFile(tracks,
                                              tempo),
            musicXml:   this.createMusicXml(tracks[0],
                                            tempo,
                                            instrument),
        };
    }
    
    // SPECULATIVE: no ancient source found for this specific breath-pause
    // pattern (position at 70% of phrase, 12-note phrase-length threshold).
    // DISABLED, not live: both createRhythmTrack() call sites are commented
    // out. The former per-syllable call used a hardcoded phraseLength of 12;
    // the former setup call passed totalNotes. Whether ancient aulos players used
    // circular/continuous breathing at all -- which bears on whether any
    // breath-pause mechanism is even the right model -- is genuinely
    // contested, not settled (Britannica: "classical writers make few
    // clear references to technical details... how the instrument was
    // played" -- confirmed independently via web search, not via West
    // directly). The specific timing/position values below remain this
    // project's own unsourced implementation either way. See
    // docs/PROVENANCE.md, "Aulos breath control (addAulosBreathControl)."
    private addAulosBreathControl(
        events: MidiEvent[],
        currentTime: number,
        phraseLength: number,
    ): void {
        if (phraseLength >= 12) {
            const breathNoteIndex = Math.floor(phraseLength * 0.7);
            const pauseDurationTicks = 120;
            const breathPauseTime =
                      currentTime + breathNoteIndex * pauseDurationTicks;
            events.push({
                            type: "note_off",
                            time: breathPauseTime,
                            data: [0, 0],
                        });
        }
    }
    
    // SOURCE: Marcus Mota's three-layer methodology (see docs/PROVENANCE.md,
    // Methodology) for the overall layer structure; the orchestration code
    // itself is infrastructure, not separately sourced.
    // Builds every requested MIDI track for one generation request. Track 1
    // (rhythm/melody) is always built; the rest are opt-in via flags.
    // Corresponds to Mota's three layers plus extras: rhythm=melody layer,
    // accent=Accent Tablature, vocalGuide=Vocal Guide, metronome=optional
    // reference click, antiphonalResponse/pantomime=Antiochene-only extras.
    private createTracks(
        processedVerses: ProcessedVerse[],
        instrument: keyof typeof this.instruments,
        tempo: number,
        mode: keyof typeof this.modes,
        includeMetronome: boolean   = !1,
        experimental?: any,
        includeAccentTrack: boolean = !1,
        includeVocalGuide: boolean  = !1,
        allowMelody: boolean        = !1,
    ): MidiTrack[] {
        // SOURCE: Ptolemy, Harmonics II.10–11 (Solomon, pp.88–92), for
        // tonoi as technical pitch positions; Plato, Republic III.398e–399a
        // and Aristotle, Politics VIII, for qualitative ethos. The two are
        // historically distinct options in this application, never combined.
        const selectedPitchMaterial = experimental?.tonos && experimental.tonos !== "none"
                                      ? "dorian"
                                      : mode;
        // SOURCE: West, Ancient Greek Music (1992), pp.148–150. In the
        // Sapphic/Alcaic model, two matching 6/8 lines are followed by a
        // longer 10/8 line produced by impaction. The input has no stanza
        // labels, so consecutive verses form repeating three-line groups
        // only when this explicit rhythm model is selected.
        const versesForTracks = experimental?.rhythmModel === "sapphic_lyric"
                                ? processedVerses.map((verse, index) => (
                {
                    ...verse,
                    sapphicLinePosition: index % 3,
                }
            ))
                                : processedVerses;
        const tracks: MidiTrack[] = [];
        tracks.push(
            this.createRhythmTrack(
                versesForTracks,
                instrument,
                selectedPitchMaterial,
                experimental,
                allowMelody,
            ),
        );
        if (includeAccentTrack) {
            tracks.push(this.createAccentTrack(versesForTracks));
        }
        if (includeVocalGuide) {
            tracks.push(
                this.createVocalGuideTrack(
                    versesForTracks,
                    selectedPitchMaterial,
                    experimental,
                    allowMelody,
                ),
            );
        }
        if (includeMetronome) {
            tracks.push(this.createMetronomeTrack(versesForTracks));
        }
        if (experimental?.antiocheneFeatures?.antiphonalResponse) {
            tracks.push(
                this.createAntiphonalResponseTrack(
                    versesForTracks,
                    instrument,
                    selectedPitchMaterial,
                    experimental,
                ),
            );
        }
        if (experimental?.antiocheneFeatures?.pantomimeLayer) {
            tracks.push(
                this.createPantomimeTrack(
                    versesForTracks,
                    instrument,
                    selectedPitchMaterial,
                    experimental,
                    allowMelody,
                ),
            );
        }
        return tracks;
    }
    
    private createRhythmTrack(
        processedVerses: ProcessedVerse[],
        instrument: keyof typeof this.instruments,
        mode: keyof typeof this.modes,
        experimental?: any,
        allowMelody?: boolean,
    ): MidiTrack {
        const events: MidiEvent[] = [];
        let currentTime = 0;
        let metricalWeight = 1.0;
        let globalSyllableIndex = 0; // Track global syllable position across all feet
        const instrumentCode = this.instruments[instrument];
        type CellType = keyof typeof this.antiocheneRhythmicCells;
        
        const percussionInstruments = [
            "tympanon",
            "krotala",
            "kymbala",
            "sistrum",
            "rhoptron",
            "keraunoskopion",
            "hand_clap_light",
            "hand_clap_strong",
        ];
        const isPercussion = percussionInstruments.includes(instrument);
        const channel = isPercussion ? 9 : 0;
        const tonosAdjustment = this.getPtolemaicTonosAdjustment(
            experimental?.tonos,
        );
        const usesPtolemaicTonos = experimental?.tonos && experimental.tonos !== "none";
        const selectedPitchMaterial = usesPtolemaicTonos ? "dorian" : mode;
        
        let scale: number[];
        if (experimental?.tuningSystem === "pythagorean") {
            scale = this.generatePythagoreanScale(60,
                                                  selectedPitchMaterial);
        } else {
            const baseNote = 60;
            scale = this.modes[selectedPitchMaterial].map((interval) => baseNote + interval);
        }
        
        if (!isPercussion && !usesPtolemaicTonos) {
            // DESIGN POLICY: retain the two-note ethos dyad for every
            // non-percussion output. The sources below support qualitative
            // modal ethos, not a prescribed melodic note pool; this project's
            // numeric realization remains SPECULATIVE. See
            // docs/PROVENANCE.md, "Modal Tonoi/ethos."
            // SPECULATIVE: ethosIntervals maps each mode to a two-note dyad as an
            // algorithmic/artistic translation of ancient qualitative modal ethos
            // into a musical interval. No ancient source encodes ethos numerically --
            // every source below describes it in moral/psychological terms only:
            // - Plato, Republic III 398e-399a: Dorian is the harmonia of a brave
            //   man's resolve in danger and his temperance in peace; Phrygian is
            //   retained alongside it; Mixolydian, tense Lydian, and (relaxed)
            //   Ionian/Lydian are rejected as suited to lamentation, drunkenness,
            //   and indolence. No interval given for any mode.
            // - Aristides Quintilianus, De Musica 1.9, paraphrasing the same
            //   Republic passage: Mixolydian/tense-Lydian are threnodic
            //   (threnodies, "suited to lament"), Ionian/Lydian are sympotic and
            //   very relaxed (sympotikas kai lian aneimenas), Dorian/Phrygian
            //   alone left over.
            // - Pseudo-Plutarch, De Musica SS148, 153, 164-165: Lydian "sharp and
            //   suited to lament" (oxeia kai epitedeios pros threnon), Mixolydian
            //   "affecting, fitting for tragedies" (pathetike, tragoidiais
            //   harmozousa), Dorian repeatedly praised for gravity/solemnity
            //   (to semnon).
            // - Aristotle, Politics VIII 1342a31-33 and 1341a18-20: critiques
            //   Plato's Republic for retaining Phrygian alongside Dorian while
            //   rejecting the aulos.
            // - Bacchius the Elder, Introductio Artis Musicae SS54: defines
            //   metabole kata ethos ("modulation of character") purely
            //   qualitatively -- simple to grandiose, calm/reflective to
            //   agitated -- with no numeric interval attached to any mode.
            // - Gaudentius, Harmonic Introduction (editorial note, Ruelle ed.):
            //   confirms ethos denoted moral/psychological character throughout
            //   the tradition, general corroborating context rather than a
            //   source for any specific interval.
            // Full citation detail: docs/PROVENANCE.md, "Modal Tonoi/ethos."
            const ethosIntervals: Record<string, [number, number]> = {
                dorian:       [0, 5],
                phrygian:     [0, 1],
                lydian:       [0, 6],
                mixolydian:   [0, 4],
                aeolian:      [0, 3],
                hypodorian:   [0, 3],
                hypophrygian: [0, 2],
                hypolydian:   [0, 4],
            };
            // The ethos dyad is selected only by the interpretive ethos
            // control (`mode`). It is not used in Ptolemaic-tonos mode.
            const intervals = ethosIntervals[mode] || [0, 4];
            const baseNote = 60;
            scale = [baseNote + intervals[0], baseNote + intervals[1]];
        }
        
        const percussionProfiles = {
            tympanon:         {
                A: {
                    note:           90,
                    velocityFactor: 0.9,
                },
                T: {
                    note:           10,
                    velocityFactor: 2.1,
                },
                N: {
                    note:           50,
                    velocityFactor: 1.0,
                },
            },
            krotala:          {
                A: {
                    note:           90,
                    velocityFactor: 0.85,
                },
                T: {
                    note:           10,
                    velocityFactor: 2.2,
                },
                N: {
                    note:           50,
                    velocityFactor: 1.0,
                },
            },
            kymbala:          {
                A: {
                    note:           90,
                    velocityFactor: 0.8,
                },
                T: {
                    note:           10,
                    velocityFactor: 2.3,
                },
                N: {
                    note:           60,
                    velocityFactor: 1.0,
                },
            },
            sistrum:          {
                A: {
                    note:           90,
                    velocityFactor: 0.9,
                },
                T: {
                    note:           10,
                    velocityFactor: 2.2,
                },
                N: {
                    note:           45,
                    velocityFactor: 1.0,
                },
            },
            rhoptron:         {
                A: {
                    note:           90,
                    velocityFactor: 0.9,
                },
                T: {
                    note:           10,
                    velocityFactor: 2.3,
                },
                N: {
                    note:           50,
                    velocityFactor: 1.0,
                },
            },
            keraunoskopion:   {
                A: {
                    note:           90,
                    velocityFactor: 0.8,
                },
                T: {
                    note:           10,
                    velocityFactor: 2.4,
                },
                N: {
                    note:           55,
                    velocityFactor: 1.0,
                },
            },
            hand_clap_light:  {
                A: {
                    note:           91,
                    velocityFactor: 0.7,
                },
                T: {
                    note:           10,
                    velocityFactor: 2.3,
                },
                N: {
                    note:           45,
                    velocityFactor: 1.0,
                },
            },
            hand_clap_strong: {
                A: {
                    note:           80,
                    velocityFactor: 1.0,
                },
                T: {
                    note:           10,
                    velocityFactor: 2.4,
                },
                N: {
                    note:           45,
                    velocityFactor: 1.1,
                },
            },
        };
        
        events.push({
                        type: "program_change",
                        time: 0,
                        data: [instrumentCode],
                    });
        
        if (instrument === "aulos" && !isPercussion) {
            const totalNotes = processedVerses.reduce(
                (sum, verse) => sum + verse.durationTablature.length,
                0,
            );
            
            // Currently disabled, because it creates out-of-sync issues with the Metronome track, the Accent track, and the  Vocal guide track.
            //this.addAulosBreathControl(events, 0, totalNotes);
        }
        
        const cellType =
                  experimental?.antiocheneFeatures?.rhythmicCells || "standard";
        const safeCellType: CellType =
                  cellType && cellType in this.antiocheneRhythmicCells
                  ? cellType
                  : "standard";
        const rhythmicCells = this.antiocheneRhythmicCells[safeCellType];
        const useRhythmicCells =
                  experimental?.rhythmModel === "antiochene_scenic" && rhythmicCells;
        
        for (const verse of processedVerses) {
            const durations = verse.durationTablature;
            const accents = verse.accentTablature;
            
            // Reset the global syllables index counter for each verse
            globalSyllableIndex = 0;
            
            // Process by metrical feet if available, otherwise fall back to syllable-by-syllable
            if (verse.metricPatterns && verse.metricPatterns.length > 0) {
                let syllableIndex = 0;
                
                // Loop through each metrical foot
                for (
                    let footIndex = 0;
                    footIndex < verse.metricPatterns.length;
                    footIndex++
                ) {
                    const footPattern = verse.metricPatterns[footIndex];
                    const footDurations = footPattern.durations || [1.0]; // Fallback if no durations
                    
                    // Process each syllable within this foot
                    for (
                        let positionInFoot = 0;
                        positionInFoot < footDurations.length;
                        positionInFoot++
                    ) {
                        if (syllableIndex >= durations.length) break; // Safety check
                        
                        const duration = durations[syllableIndex];
                        let cellVelocityModifier = 1.0;
                        let cellPitchModifier = 0;
                        
                        // Apply a selected modifier cycle only to the matching
                        // parsed foot. West (1987), pp.55-57, 66-67, supports
                        // the general dramatic practice of combining/changing
                        // metrical units, not this cycle's order or MIDI rules.
                        // This is deliberately foot-based, never a raw
                        // syllable-count overlay.
                        if (useRhythmicCells && rhythmicCells) {
                            const currentCell =
                                      rhythmicCells[footIndex % rhythmicCells.length];
                            
                            if (footPattern.foot === currentCell.pattern) {
                                if (cellType === "dochmiac_paeon_cretic") {
                                    if (currentCell.name === "dochmiac") {
                                        if (currentCell.emotion === "passionate") {
                                            cellVelocityModifier = 1.4;
                                            cellPitchModifier = 2;
                                        }
                                    } else if (currentCell.name === "fourth_paeon") {
                                        if (currentCell.emotion === "flowing") {
                                            cellVelocityModifier = 0.85;
                                            cellPitchModifier = -1;
                                        }
                                    } else if (currentCell.name === "cretic") {
                                        if (currentCell.emotion === "solemn") {
                                            cellVelocityModifier = 1.0;
                                            cellPitchModifier = 0;
                                        }
                                    }
                                } else if (cellType === "paeon_cretic_iamb") {
                                    if (currentCell.name === "first_paeon") {
                                        if (currentCell.emotion === "ascending") {
                                            cellVelocityModifier = 1.2;
                                            cellPitchModifier = 3;
                                        }
                                    } else if (currentCell.name === "cretic") {
                                        cellVelocityModifier = 1.0;
                                        cellPitchModifier = 0;
                                    } else if (currentCell.name === "iamb") {
                                        cellVelocityModifier = 1.0;
                                        cellPitchModifier = 0;
                                    }
                                }
                            }
                        }
                        
                        // DISABLED, by explicit decision: aulos breath
                        // control is still experimental -- prior listening tests
                        // found it didn't sound right and delayed rhythms,
                        // conflicting with Mota's synchronized-track methodology
                        // (see docs/PROVENANCE.md, Methodology: three-layer
                        // architecture). Deferred for future implementation, not
                        // removed. The call below is commented out for zero
                        // current sound change; the phraseLength argument was
                        // corrected from 10 to 12 to match this function's own
                        // >=12 guard (previously silently inert due to that
                        // mismatch, not a deliberate disable) so that if this is
                        // ever re-enabled, it will actually execute as intended
                        // rather than silently doing nothing again. See
                        // docs/TODO.md, "Aulos breath control -- deferred."
                        // if (
                        //     instrument === "aulos" &&
                        //     !isPercussion &&
                        //     syllableIndex % 10 === 0 &&
                        //     syllableIndex > 0
                        // ) {
                        //     this.addAulosBreathControl(events,
                        //                                currentTime,
                        //                                12);
                        // }
                        
                        let note: number;
                        let velocity: number;
                        
                        if (isPercussion) {
                            note = this.getPercussionNote(instrument as any);
                            velocity = Math.min(
                                127,
                                Math.max(
                                    40,
                                    Math.round(80 + (
                                        accents[syllableIndex] || 0
                                    ) * 30),
                                ),
                            );
                        } else {
                            const baseNote = 60;
                            if (scale.length === 0) {
                                throw new Error("Scale cannot be empty");
                            }
                            
                            let scaleOffset = 0;
                            let arsisThesisPitchAdjust = 0;
                            
                            // Foot-aware note selection using metricPatterns`
                            
                            if (!allowMelody) {
                                if (verse.arsisThesisPattern) {
                                    const foot = verse.metricPatterns[footIndex];
                                    for (
                                        let durIndex = 0;
                                        durIndex < foot.durations.length;
                                        durIndex++
                                    ) {
                                        // PATCH HERE
                                        const cleanPattern =
                                                  verse.arsisThesisPattern?.replace(/\s+/g,
                                                                                    "") || "";
                                        const marks = cleanPattern.split("-");
                                        const currentMark = marks[globalSyllableIndex];
                                        
                                        // Explicit mark checks
                                        const isArsis = currentMark === "A";
                                        const isThesis = currentMark === "T";
                                        const isAcute =
                                                  verse.acuteAccentTablature?.[globalSyllableIndex];
                                        
                                        // Note assignment
                                        // Acute-accent override is disabled.
                                        //if (isAcute) {
                                        //  note = 67; // sol
                                        //} else
                                        
                                        if (experimental?.noAccentFallback) {
                                            // The fallback leaves pitch unmarked; any velocity
                                            // remains the independently calculated foot accent,
                                            // not an arsis/thesis distinction.
                                            // This separate flat-baseline option preserves the
                                            // selected mode without a pitch distinction.
                                            note = 60;
                                            velocity = Math.min(
                                                118,
                                                95 + (
                                                       foot.accents[durIndex] || 0
                                                   ) * 11,
                                            );
                                        } else {
                                            // Dispatch to Lynch's model -- see
                                            // getArsisThesisPitchLynch()/
                                            // getArsisThesisVelocityLynch() above.
                                            note = this.getArsisThesisPitchLynch(isArsis,
                                                                                 isThesis);
                                            velocity = this.getArsisThesisVelocityLynch(
                                                foot.accents[durIndex] || 0,
                                            );
                                        }
                                        // PATCH HERE - END
                                        
                                        globalSyllableIndex++;
                                    }
                                } else {
                                    // Case 2: Non-melody, Non-arsis-thesis: Use the ethosIntervals scale created above
                                    const noteIndex = globalSyllableIndex % 2; // Alternate between the 2 characteristic notes
                                    scaleOffset = scale[noteIndex] - scale[0]; // Set scaleOffset instead of note directly
                                    
                                    // Simple velocity based on position in foot
                                    velocity = Math.min(
                                        127,
                                        Math.max(
                                            60,
                                            Math.round(80 + (
                                                accents[syllableIndex] || 0
                                            ) * 20),
                                        ),
                                    );
                                }
                            } else {
                                // Case 3: Melody, with arsis-thesis
                                if (verse.arsisThesisPattern) {
                                    const marks = verse.arsisThesisPattern.split("-");
                                    const mark = marks[syllableIndex] || "T";
                                    const isArsis = mark === "A";
                                    const isThesis = mark === "T";
                                    
                                    // Use foot index to determine base scale position -
                                    // this picks which scale degree plays, driven by foot
                                    // position, same regardless of arsis/thesis mark.
                                    let baseScaleIndex =
                                            (
                                                footIndex * 2 + positionInFoot
                                            ) % scale.length;
                                    
                                    if (experimental?.noAccentFallback) {
                                        // Fallback (checkbox): no arsis/thesis-specific
                                        // pitch adjustment at all - same scale-degree
                                        // selection as Case 4 below, arsisThesisPitchAdjust
                                        // stays 0.
                                    } else {
                                        // Dispatch to Lynch's model -- see
                                        // getArsisThesisPitchAdjustLynch() above.
                                        // This was missing from this code path entirely
                                        // before an earlier fix - see docs/PROVENANCE.md,
                                        // Thesis/Arsis marking, "Melody-mode implementation
                                        // gap."
                                        arsisThesisPitchAdjust =
                                            this.getArsisThesisPitchAdjustLynch(isArsis,
                                                                                isThesis);
                                    }
                                    scaleOffset = scale[baseScaleIndex] - scale[0];
                                } else {
                                    // Case 4: Melody, no arsis-thesis
                                    // Create melodic contour based on foot structure
                                    const melodyIndex =
                                              (
                                                  footIndex * 3 + positionInFoot
                                              ) % scale.length;
                                    scaleOffset = scale[melodyIndex] - scale[0];
                                }
                            }
                            
                            // Calculate and normalize the initial note value.
                            let tempNote = baseNote + scaleOffset + cellPitchModifier + arsisThesisPitchAdjust;
                            
                            // Keep calculated notes within the working octave range (60-71).
                            while (tempNote >= 72) tempNote -= 12; // Keep below C5
                            while (tempNote < 60) tempNote += 12; // Keep at or above C4
                            
                            // Use a consistent octave for equal pitch classes.
                            const pitchClass = tempNote % 12;
                            note = 60 + pitchClass; // Force into C4-B4 octave
                            
                            // Keep the final note in the same working octave range.
                            if (note > 71) note -= 12;
                            if (note < 60) note += 12;
                            
                            // Apply the arsis/thesis pitch contrast without changing octave placement.
                            if (verse.arsisThesisPattern) {
                                const cleanPattern =
                                          verse.arsisThesisPattern.replace(/\s+/g,
                                                                           "") || "";
                                const marks = cleanPattern.split("-");
                                
                                // CRITICAL FIX: Use modulo to cycle through the pattern correctly
                                const patternIndex = syllableIndex % marks.length;
                                const currentMark = marks[patternIndex];
                                
                                if (experimental?.noAccentFallback) {
                                    // Fallback (checkbox): exactly today's no-accent behavior -
                                    // leave whatever pitch was already selected untouched.
                                } else {
                                    // Dispatch to Lynch's model -- reuses
                                    // getArsisThesisPitchAdjustLynch() above (same
                                    // relative-adjustment shape as the melody-mode fix).
                                    note += this.getArsisThesisPitchAdjustLynch(
                                        currentMark === "A",
                                        currentMark === "T",
                                    );
                                }
                                
                                // Override for acute accents (check using syllableIndex, not globalSyllableIndex)
                                // Acute-accent override is disabled.
                                //if (verse.acuteAccentTablature?.[syllableIndex]) {
                                //  note = 67; // Always G4 for acute accents
                                //}
                            }
                            
                            // SOURCE: Ptolemy, Harmonics II.10–11 (Solomon,
                            // pp.88–92). A selected tonos transposes the final
                            // pitch position; it does not select an ethos dyad or
                            // replace the genus. Compatibility of a Ptolemaic
                            // tonos with this project's qualitative ethos mapping
                            // is unknown and is exposed in the UI as experimental.
                            note += tonosAdjustment.semitones;
                            
                            // Calculate velocity with metrical weight
                            let metricalWeight = 1.0;
                            if (verse.arsisThesisPattern) {
                                const marks = verse.arsisThesisPattern.split("-");
                                // metricalWeight stays 1.0 (declared above).
                                velocity = this.getArsisThesisVelocityLynchB(
                                    accents[syllableIndex] || 0,
                                );
                            } else {
                                const baseVelocity = Math.round(
                                    70 + (
                                           accents[syllableIndex] || 0
                                       ) * 25,
                                );
                                velocity = Math.min(
                                    127,
                                    Math.max(60,
                                             Math.round(baseVelocity * cellVelocityModifier)),
                                );
                            }
                            
                            // Apply acute accent override if present
                            // Acute-accent override is disabled.
                            //if (
                            //  verse.acuteAccentTablature &&
                            //  verse.acuteAccentTablature[syllableIndex]
                            //) {
                            //  note = 67; // Sol - direct assignment
                            //  velocity = Math.min(
                            //    127,
                            //    Math.max(
                            //      80,
                            //      Math.round(85 + (accents[syllableIndex] || 0) * 15),
                            //   ),
                            //  );
                            //}
                            
                            // Apply genus effects
                            const effectiveGenus = verse.arsisThesisPattern
                                                   ? "enharmonic"
                                                   : experimental?.genus;
                            if (effectiveGenus === "chromatic") {
                                if (accents[syllableIndex] >= 1.0) {
                                    // SOURCE: Aristoxenus' "tonic chromatic" shade (Hagel
                                    // 2009, p.153; docs/PROVENANCE.md): 1/2+1/2+1 1/2 tone
                                    // = a 2-semitone pyknon (the "crowded" lower pair of
                                    // the tetrachord) below a 3-semitone step. Cycles
                                    // deterministically through the pyknon (+1, then -1)
                                    // on accented syllables.
                                    const chromaticPyknonSteps = [1, -1];
                                    note +=
                                        chromaticPyknonSteps[
                                        syllableIndex % chromaticPyknonSteps.length
                                            ];
                                }
                            }
                            
                            if (effectiveGenus === "diatonic") {
                                // SOURCE: Hagel (2009), p.153, tense diatonic is
                                // semitone-tone-tone ([0,1,3,5]). The live Dorian
                                // mode now provides that base shape directly, so this
                                // branch deliberately adds no accent-pitch nudge.
                                // See PROVENANCE, "Genera: diatonic (Dorian)."
                            }
                            
                            // Both blocks below (Archytas enharmonic quarter-tone, and
                            // Pythagorean comma correction) can fire on the same syllable
                            // at the same currentTime tick. MIDI pitch-bend (event type
                            // "pitch_bend" below) is an ABSOLUTE value per channel, not an
                            // additive one: a second pitch_bend event at the same tick on
                            // the same channel does not stack with the first, it replaces
                            // it outright. Previously each block pushed its own event
                            // independently, so when both fired, the later Pythagorean
                            // event silently discarded the earlier Archytas correction and
                            // only the Pythagorean value sounded. Cents ARE additive
                            // (cents = 1200*log2(ratio), so cents for a compound interval
                            // sum -- this is standard log-interval arithmetic, not an
                            // ancient claim requiring citation; the ratios being combined
                            // -- Archytas 28:27/36:35 via Ptolemy, Harmonics I.13, and the
                            // Pythagorean 3:2-fifths-cycle correction -- are each already
                            // cited at their own computation site below). Fix: each block
                            // now only computes its own cents offset and whether it
                            // applies; the two are summed into a single combined cents
                            // value and exactly one pitch_bend event is pushed per
                            // syllable, after both blocks. See docs/TODO.md, item 0
                            // ("Secondary, lower-priority finding") and docs/PROVENANCE.md,
                            // Tuning: Pythagorean fifths, for the prior documented bug.
                            //
                            // NOT AN ANCIENT PRACTICE, confirmed against Ptolemy's primary
                            // text: combining these two corrections on one note is this
                            // project's own synthesis. Pythagorean tuning (stacked 3:2
                            // fifths) generates the fixed/standing pitches of the gamut,
                            // genus-independent; Archytas' ratios describe how the MOVEABLE
                            // inner notes of a tetrachord divide specifically for the
                            // enharmonic genus -- two different structural questions in
                            // ancient theory, not two layers of the same one. Ptolemy,
                            // Harmonics I.12-13 and II.13-14 (received in full), lay out
                            // Archytas', Aristoxenus', Eratosthenes', Didymus', and
                            // Ptolemy's own tetrachord divisions as parallel columns in
                            // comparison tables -- one complete, self-contained division per
                            // theorist, per genus -- explicitly for comparing alternatives,
                            // never combined with each other or with a separate fifths-
                            // generated framework. Archytas' ratios are also not 3-limit
                            // (Pythagorean) -- 28:27 and 36:35 both involve the prime 7 --
                            // so this combination layers two systems that are, in that
                            // specific sense, in tension rather than complementary. The fix
                            // above only guarantees the combination is internally consistent
                            // (additive, not silently colliding) given that the software
                            // lets a user select both `tuningSystem: "pythagorean"` and
                            // enharmonic genus at once -- it is not a claim that ancient
                            // musicians combined these two systems. See docs/PROVENANCE.md,
                            // Tuning: Pythagorean fifths, "Author's decision" note.
                            let archytasCents = 0;
                            let archytasApplies = false;
                            let pythagoreanCents = 0;
                            let pythagoreanApplies = false;
                            
                            if (effectiveGenus === "enharmonic") {
                                if (accents[syllableIndex] >= 1.0) {
                                    // SOURCE (verified): Ptolemy, Harmonics I.13 (Solomon trans.,
                                    // pp.43-44; see docs/PROVENANCE.md),
                                    // reporting Archytas' enharmonic genus ratios 28:27 and 36:35.
                                    // In cents: 28:27=62.96 (~63), 36:35=48.77 (~49) - matches
                                    // exactly.
                                    const archytasIntervals = [63, 49, -63, -49];
                                    const intervalIndex =
                                              syllableIndex % archytasIntervals.length;
                                    const quarterToneCents = archytasIntervals[intervalIndex];
                                    if (syllableIndex % 4 === 0 || syllableIndex % 4 === 1) {
                                        archytasCents = quarterToneCents;
                                        archytasApplies = true;
                                    }
                                }
                            }
                            
                            // Four new shades, added together, all
                            // sourced from the same table: Hagel, Ancient Greek Music
                            // (2009), p.153 -- see docs/PROVENANCE.md, "Genera: chromatic
                            // pyknon," "Full shade table," for the complete table and the
                            // already-implemented tonic chromatic (100+100+300c) and tense
                            // diatonic (100+200+200c, this.modes.dorian's base shape) rows.
                            // Same architecture as the existing tonic-chromatic/enharmonic
                            // branches above: a deterministic pitch nudge on accented
                            // syllables, cycling +/-, NOT a tetrachord reconstruction --
                            // explicitly an artistic/algorithmic representation of the
                            // shade's characteristic interval, same honesty framing already
                            // established for tonic chromatic (see that entry). Reuses
                            // archytasCents/archytasApplies above when the selected genus is
                            // enharmonic_symmetric (mutually exclusive with plain
                            // "enharmonic" by construction of the genus enum, so sharing the
                            // variable is safe -- only one of the two conditions can ever be
                            // true for a given syllable).
                            if (effectiveGenus === "enharmonic_symmetric") {
                                if (accents[syllableIndex] >= 1.0) {
                                    // SOURCE: Hagel p.153, "Enharmonic (Aristoxenus' own --
                                    // distinct from Archytas')": 1/4+1/4+2 tone = 50+50+400c.
                                    // Symmetric pyknon (both steps equal), unlike Archytas'
                                    // asymmetric 63/49 above -- the defining difference
                                    // between the two enharmonic reconstructions.
                                    const symmetricIntervals = [50, -50, 50, -50];
                                    const intervalIndex =
                                              syllableIndex % symmetricIntervals.length;
                                    if (syllableIndex % 4 === 0 || syllableIndex % 4 === 1) {
                                        archytasCents = symmetricIntervals[intervalIndex];
                                        archytasApplies = true;
                                    }
                                }
                            }
                            
                            let genusShadeCents = 0;
                            let genusShadeApplies = false;
                            
                            if (effectiveGenus === "chromatic_soft") {
                                if (accents[syllableIndex] >= 1.0) {
                                    // SOURCE: Hagel p.153, "Soft chromatic": 1/3+1/3+1 5/6
                                    // tone = 67+67+367c. Pyknon step 67c (vs. tonic
                                    // chromatic's 100c already implemented above).
                                    const softChromaticSteps = [67, -67];
                                    genusShadeCents =
                                        softChromaticSteps[syllableIndex % softChromaticSteps.length];
                                    genusShadeApplies = true;
                                }
                            }
                            
                            if (effectiveGenus === "chromatic_hemiolic") {
                                if (accents[syllableIndex] >= 1.0) {
                                    // SOURCE: Hagel p.153, "Hemiolic chromatic": 3/8+3/8+1 3/4
                                    // tone = 75+75+350c. Pyknon step 75c.
                                    const hemiolicSteps = [75, -75];
                                    genusShadeCents =
                                        hemiolicSteps[syllableIndex % hemiolicSteps.length];
                                    genusShadeApplies = true;
                                }
                            }
                            
                            if (effectiveGenus === "diatonic_soft") {
                                if (accents[syllableIndex] >= 1.0) {
                                    // SOURCE: Hagel p.153, "Soft diatonic": 1/2+3/4+1 1/4 tone
                                    // = 100+150+250c, vs. tense diatonic (this.modes.dorian's
                                    // base shape) at 100+200+200c. Diatonic genus has no
                                    // pyknon in the structural sense chromatic/enharmonic do
                                    // (no pair of intervals smaller than the third) -- this
                                    // nudge is this project's own representation of the
                                    // 50-cent difference in the shade's middle interval
                                    // (150c soft vs. 200c tense), not a direct ancient
                                    // encoding. Flagged as such, same honesty pattern as
                                    // tonic chromatic above.
                                    const softDiatonicSteps = [50, -50];
                                    genusShadeCents =
                                        softDiatonicSteps[syllableIndex % softDiatonicSteps.length];
                                    genusShadeApplies = true;
                                }
                            }
                            
                            if (experimental?.tuningSystem === "pythagorean") {
                                const midiFreq = 440 * Math.pow(2,
                                                                (
                                                                    note - 69
                                                                ) / 12);
                                const fifthsFromC = this.getFifthsFromC(note % 12);
                                const targetFreq = this.calculatePythagoreanFrequency(
                                    midiFreq,
                                    fifthsFromC,
                                );
                                const { centsOffset } =
                                          this.frequencyToMidiNoteAndCents(targetFreq);
                                
                                const bendAmount = centsOffset;
                                
                                if (Math.abs(bendAmount) > 5) {
                                    pythagoreanCents = bendAmount;
                                    pythagoreanApplies = true;
                                }
                            }
                            
                            if (tonosAdjustment.cents !== 0 || archytasApplies || pythagoreanApplies || genusShadeApplies) {
                                const combinedCents = tonosAdjustment.cents +
                                                      archytasCents + pythagoreanCents + genusShadeCents;
                                const pitchBend = this.centsToPitchBend(combinedCents);
                                events.push({
                                                type: "pitch_bend",
                                                time: currentTime,
                                                data: [
                                                    pitchBend & 0x7f, (
                                                                          pitchBend >> 7
                                                                      ) & 0x7f,
                                                ],
                                            });
                            }
                        }
                        
                        let length = this.calculateNoteLength(
                            duration,
                            syllableIndex,
                            verse,
                            experimental,
                            allowMelody,
                        );
                        // calculateNoteLength() already applies the metrical
                        // duration. In chronos_ratios, specifically, U = 1 and
                        // - = 2 chronoi (Aristoxenus, Elementa Rhythmica II.30).
                        // Do not rescale short syllables merely because an
                        // arsis/thesis map is present: the former A/T-only
                        // adjustment halved U a second time, producing 4:1
                        // rather than the intended 2:1 long:short ratio.
                        
                        events.push({
                                        type: "note_on",
                                        time: currentTime,
                                        data: [note, velocity],
                                    });
                        
                        // Add interpretative melismatic ornaments if enabled.
                        // The primary note was emitted immediately above and
                        // is released by the shared note-off below; this helper
                        // must add ornaments only, never another base-note pair.
                        if (
                            experimental?.antiocheneFeatures?.melismaticOrnamentation &&
                            !isPercussion
                            //&& accents[syllableIndex] > 1.2
                        ) {
                            this.addAntiocheneOrnamentation(
                                events,
                                verse,
                                syllableIndex,
                                note,
                                currentTime,
                                length,
                                instrument,
                                velocity,
                            );
                        }
                        
                        let noteOffAdjustment = isPercussion ? 50 : 20;
                        if (verse.arsisThesisPattern) {
                            const marks = verse.arsisThesisPattern.split("-");
                            if (marks.length > 0) {
                                const markIndex = syllableIndex % marks.length;
                                const mark = marks[markIndex];
                                noteOffAdjustment = mark === "T" ? 20 : 15;
                            }
                        }
                        
                        //const noteOffTime = currentTime + length - noteOffAdjustment;
                        const noteOffTime = currentTime + length;
                        
                        events.push({
                                        type: "note_off",
                                        time: noteOffTime,
                                        data: [note, 0],
                                    });
                        
                        if ((
                                experimental?.tuningSystem === "pythagorean" || tonosAdjustment.cents !== 0
                            ) && !isPercussion) {
                            events.push({
                                            type: "pitch_bend",
                                            time: noteOffTime + 1,
                                            data: [0x00, 0x40],
                                        });
                        }
                        
                        currentTime += length;
                        currentTime = Math.round(currentTime); // Prevents micro-gaps from floating-point math
                        
                        syllableIndex++;
                    }
                    
                    // Foot separation timing: flat 15ms, applied the same
                    // whether or not arsis/thesis is marked. Previously
                    // asymmetric across the four duplicate copies of this
                    // logic in this file - one copy (search
                    // "Sync foot separation with other tracks") silently
                    // subtracted 65ms per foot when arsisThesisPattern was
                    // false, a swing of 80ms/foot that caused audible
                    // slowdown whenever arsis/thesis was enabled. Fixed -
                    // see docs/PROVENANCE.md, Thesis/Arsis marking,
                    // "Foot-separation timing bug," for the full account.
                    // The comments previously here cited "anaklasis" and
                    // "synaesthesia" (Elementa II.22) as Aristoxenus's
                    // terms for this - removed. Neither term appears
                    // anywhere in the Aristoxenus material checked this
                    // project (Marchetti's edition, Lynch 2016/2020,
                    // Weil & Reinach's De Musica) - unverifiable, treated
                    // as fabricated.
                    const footSeparationTime = 15;
                    currentTime += footSeparationTime;
                    
                    // Add foot boundary pause if specified in verse.pauseAfter
                    // DELIBERATELY DISABLED, not dead/forgotten code - keep commented.
                    // Re-enabling this doubled the actual pauses between feet when
                    // tried before. The working conclusion: pauses between individual
                    // notes/strokes within a foot are fine, but no *additional* pause
                    // should be inserted at foot boundaries specifically - confirmed
                    // as reflecting the common scholarly view that the ancients
                    // heard feet as continuous, without audible gaps marking the
                    // boundary between one foot and the next. Still not yet checked
                    // against her actual text (not received) - treat as a confirmed
                    // design rationale, not a page-cited source, until then. Same
                    // pattern repeats at 4 other locations in this file, each
                    // pointing back here.
                    if (verse.pauseAfter && verse.pauseAfter[syllableIndex - 1]) {
                        //currentTime += verse.pauseAfter[syllableIndex - 1];
                    }
                }
            } else {
                // Fallback to original syllable-by-syllable processing if no metricPatterns
                durations.forEach((duration: number, index: number) => {
                    // [Original processing code for syllable-by-syllable would go here]
                    // This is the fallback case - you can keep the original implementation
                    // or create a simplified version
                    
                    let note: number;
                    let velocity: number;
                    
                    if (isPercussion) {
                        note = this.getPercussionNote(instrument as any);
                        velocity = Math.min(
                            127,
                            Math.max(40,
                                     Math.round(80 + (
                                         accents[index] || 0
                                     ) * 30)),
                        );
                    } else {
                        const baseNote = 60;
                        const scaleOffset = !allowMelody
                                            ? scale[index % 2] - scale[0]
                                            : scale[index % scale.length] - scale[0];
                        note = baseNote + scaleOffset;
                        while (note > 71) note -= 12;
                        while (note < 60) note += 12;
                        
                        velocity = Math.min(
                            127,
                            Math.max(60,
                                     Math.round(70 + (
                                         accents[index] || 0
                                     ) * 25)),
                        );
                    }
                    
                    const length = this.calculateNoteLength(
                        duration,
                        index,
                        verse,
                        experimental,
                        allowMelody,
                    );
                    
                    events.push({
                                    type: "note_on",
                                    time: currentTime,
                                    data: [note, velocity],
                                });
                    
                    const noteOffTime = currentTime + length - (
                        isPercussion ? 50 : 20
                    );
                    events.push({
                                    type: "note_off",
                                    time: noteOffTime,
                                    data: [note, 0],
                                });
                    
                    currentTime += length;
                });
            }
            
            // Add verse separation timing
            currentTime += 120;
        }
        
        return {
            channel,
            instrument: instrumentCode,
            events,
        };
    }
    
    private createMetronomeTrack(processedVerses: ProcessedVerse[]): MidiTrack {
        const events: MidiEvent[] = [];
        let currentTime = 0;
        const strongClickNote = 37; // Stronger click for downbeats
        const weakClickNote = 31; // Weaker click for subdivisions
        
        events.push({
                        type: "program_change",
                        time: 0,
                        data: [0],
                    });
        
        for (const verse of processedVerses) {
            const durations = verse.durationTablature;
            
            // Use metrical foot structure if available
            if (verse.metricPatterns && verse.metricPatterns.length > 0) {
                let syllableIndex = 0;
                
                // Loop through each metrical foot
                for (
                    let footIndex = 0;
                    footIndex < verse.metricPatterns.length;
                    footIndex++
                ) {
                    const footPattern = verse.metricPatterns[footIndex];
                    const footDurations = footPattern.durations || [1.0];
                    
                    // Process each syllable within this foot
                    for (
                        let positionInFoot = 0;
                        positionInFoot < footDurations.length;
                        positionInFoot++
                    ) {
                        if (syllableIndex >= durations.length) break;
                        
                        const duration = durations[syllableIndex];
                        
                        // Calculate note length using the same method as rhythm track
                        const length = this.calculateNoteLength(
                            duration,
                            syllableIndex,
                            verse,
                            this.experimental,
                            false, // no melody for metronome
                        );
                        
                        // Determine if this should get a metronome click
                        let shouldClick = false;
                        let clickNote = weakClickNote;
                        let clickVelocity = 50;
                        
                        // ONLY click on long syllables (duration >= 1.0)
                        // Remove position-based clicking to ensure consistency
                        if (duration >= 1.0) {
                            shouldClick = true;
                            clickNote = strongClickNote; // Use strong click for all long notes
                            clickVelocity = 70;
                            
                            // Extra emphasis for verse beginnings
                            if (footIndex === 0 && positionInFoot === 0 && duration >= 1.0) {
                                clickVelocity = 90;
                            }
                        }
                        
                        if (shouldClick) {
                            // Adjusted delay based on your testing
                            const clickDelay = 25;
                            
                            events.push({
                                            type: "note_on",
                                            time: currentTime + clickDelay,
                                            data: [clickNote, clickVelocity],
                                        });
                            
                            events.push({
                                            type: "note_off",
                                            time: currentTime + clickDelay + 48,
                                            data: [clickNote, 0],
                                        });
                        }
                        
                        currentTime += length;
                        syllableIndex++;
                    }
                    
                    // Foot separation timing: 15ms, uniform regardless of
                    // arsis/thesis - see docs/PROVENANCE.md, Thesis/Arsis
                    // marking, "Foot-separation timing bug," for the fix
                    // and why (fabricated-citation comments removed).
                    const footSeparationTime = verse.arsisThesisPattern
                                               ? 15
                                               : 15;
                    currentTime += footSeparationTime;
                    
                    // Add foot boundary pause if specified
                    // DELIBERATELY DISABLED - see full explanation at
                    // server/services/midi-generator.ts:1655 (doubled foot-boundary
                    // pauses).
                    if (verse.pauseAfter && verse.pauseAfter[syllableIndex - 1]) {
                        //currentTime += verse.pauseAfter[syllableIndex - 1];
                    }
                }
            } else {
                // Fallback to syllable-by-syllable processing
                durations.forEach((duration: number, index: number) => {
                    // Only click on long syllables in fallback mode
                    if (duration >= 1.0) {
                        const clickNote = index === 0 ? strongClickNote : weakClickNote;
                        const clickVelocity = index === 0 ? 100 : 60;
                        
                        events.push({
                                        type: "note_on",
                                        time: currentTime,
                                        data: [clickNote, clickVelocity],
                                    });
                        
                        events.push({
                                        type: "note_off",
                                        time: currentTime + 48,
                                        data: [clickNote, 0],
                                    });
                    }
                    
                    currentTime += Math.max(Math.floor(duration * 480),
                                            30);
                });
            }
            
            // Add verse separation timing
            currentTime += 120;
        }
        
        return {
            channel:    9,
            instrument: 0,
            events,
        };
    }
    
    private computeFootStructure(
        durations: number[],
    ): { footName: string; start: number; length: number }[] {
        // Unused helper. Its ratios are descriptive metadata and do not
        // drive the live duration-generation path.
        const footRatios = {
            dactyl:         [2, 1, 1],
            anapest:        [1, 1, 2],
            iamb:           [1, 2],
            trochee:        [2, 1],
            spondee:        [2, 2],
            amphibrach:     [1, 2, 1],
            cretic:         [2, 1, 2],
            tribrach:       [1, 1, 1],
            molossus:       [2, 2, 2],
            first_paeon:    [2, 1, 1, 1],
            second_paeon:   [1, 2, 1, 1],
            third_paeon:    [1, 1, 2, 1],
            fourth_paeon:   [1, 1, 1, 2],
            choriamb:       [2, 1, 1, 2],
            ionic_a_minore: [1, 1, 2, 2],
            ionic_a_maiore: [2, 2, 1, 1],
            // DEAD CODE (footRatios, duplicated 2x in this file, zero live
            // callers -- see docs/HANDOFF.md). Kept consistent with the
            // live table's primary shape (server/services/metrical-analysis.ts,
            // metricalPatterns["U--U-"]) per project policy.
            dochmiac:       [1, 2, 2, 1, 2],
            proceleusmatic: [1, 1, 1, 1],
            epitrite_1:     [1, 2, 2, 2],
            epitrite_2:     [2, 1, 2, 2],
            epitrite_3:     [2, 2, 1, 2],
            epitrite_4:     [2, 2, 2, 1],
            anceps_long:    [1.5, 2],
            short_anceps:   [1, 1.5],
            anceps_single:  [1.5],
            // Metrical bacchius family (fixed 3-syllable feet) - real,
            // standard nomenclature, but NOT Lynch's rhythmical bacchius
            // (see bacchius_rhythmical_1/2 below). Do not conflate the
            // two - see docs/PROVENANCE.md, "Rhythm: rhythmical bacchius."
            bacchius:      [1, 2, 2],
            antibacchius:  [2, 2, 1],
            palimbacchius: [2, 1, 2],
            // Lynch's rhythmical bacchius (2020): a compound foot
            // conjoining a full iamb (1:2) and a full trochee (2:1) as
            // two separate arsis/thesis pairs - see docs/PROVENANCE.md,
            // "Rhythm: rhythmical bacchius."
            bacchius_rhythmical_1: [1, 2, 2, 1], // iamb + trochee
            bacchius_rhythmical_2: [2, 1, 1, 2], // trochee + iamb
            // "Larger"/"greater" feet (Lynch 2020): 4x-magnitude
            // versions of basic feet, same ratio, slower tempo. See
            // docs/PROVENANCE.md, "Rhythm: larger feet (Orthios,
            // trochaios semantos, greater spondee, paion epibatos)."
            orthios:            [4, 8],  // "larger" iamb, still 1:2
            trochaios_semantos: [8, 4],  // "larger" trochee, still 2:1
            greater_spondee:    [4, 4],  // "larger" spondee, still 1:1
            // SPECULATIVE: Lynch flags the source passage (Arist. Quint.
            // 37.10-12) as possibly corrupted ("the text may be
            // corrupted, see apparatus ad loc."). [4,6] is her stated
            // total (4:6, "unlikely" alternative reading 6:4 rejected);
            // the internal 4-part division is not confidently
            // reconstructable from a corrupted source - see
            // docs/PROVENANCE.md.
            paion_epibatos: [4, 6],
            long_single:    [2],
            short_single:   [1],
        };
        const structure = [];
        let i = 0;
        while (i < durations.length) {
            const footName = this.matchFootAtIndex(durations,
                                                   i);
            const footLength = footRatios[footName as keyof typeof footRatios]?.length || 1;
            if (!footName) {
                structure.push({
                                   footName: "unknown",
                                   start:    i,
                                   length:   1,
                               });
                i++;
            } else {
                structure.push({
                                   footName,
                                   start:  i,
                                   length: footLength,
                               });
                i += footLength;
            }
        }
        return structure;
    }
    
    private createAccentTrack(processedVerses: ProcessedVerse[]): MidiTrack {
        const events: MidiEvent[] = [];
        let currentTime = 0;
        
        type FootType = "dactyl" | "iamb" | "spondee";
        const footToPercussion: Record<
            FootType,
            { note: number; velocityScale: number }
        > = {
            dactyl:  {
                note:          36,
                velocityScale: 1.2,
            },
            iamb:    {
                note:          38,
                velocityScale: 1.0,
            },
            spondee: {
                note:          37,
                velocityScale: 1.5,
            },
        };
        
        events.push({
                        type: "program_change",
                        time: 0,
                        data: [0],
                    });
        
        for (const verse of processedVerses) {
            const durations = verse.durationTablature;
            const accents = verse.accentTablature;
            
            // Use metrical foot structure
            if (verse.metricPatterns && verse.metricPatterns.length > 0) {
                let syllableIndex = 0;
                
                // Loop through each metrical foot
                for (
                    let footIndex = 0;
                    footIndex < verse.metricPatterns.length;
                    footIndex++
                ) {
                    const footPattern = verse.metricPatterns[footIndex];
                    const footDurations = footPattern.durations || [1.0];
                    
                    // Process each syllable within this foot
                    for (
                        let positionInFoot = 0;
                        positionInFoot < footDurations.length;
                        positionInFoot++
                    ) {
                        if (syllableIndex >= durations.length) break;
                        
                        const duration = durations[syllableIndex];
                        const accent = accents[syllableIndex] || 0;
                        
                        // Calculate note length using the same method as rhythm track
                        const length = this.calculateNoteLength(
                            duration,
                            syllableIndex,
                            verse,
                            this.experimental,
                            false, // no melody for accent
                        );
                        
                        let footType: FootType = "iamb";
                        const nextDuration = durations[syllableIndex + 1];
                        
                        if (
                            duration > 1.2 &&
                            nextDuration !== undefined &&
                            nextDuration < 0.8
                        ) {
                            footType = "dactyl";
                        } else if (
                            duration > 1.0 &&
                            nextDuration !== undefined &&
                            nextDuration > 1.0
                        ) {
                            footType = "spondee";
                        }
                        
                        const percussionConfig = footToPercussion[footType];
                        if (accent >= 1.0 && percussionConfig) {
                            const velocity = Math.min(
                                127,
                                Math.round(60 + accent * 30 * percussionConfig.velocityScale),
                            );
                            
                            // Adjusted delay to match metronome track
                            const clickDelay = 25;
                            
                            events.push({
                                            type: "note_on",
                                            time: currentTime + clickDelay,
                                            data: [percussionConfig.note, velocity],
                                        });
                            
                            events.push({
                                            type: "note_off",
                                            time: currentTime + clickDelay + 48,
                                            data: [percussionConfig.note, 0],
                                        });
                        }
                        
                        currentTime += length;
                        syllableIndex++;
                    }
                    
                    // Foot separation timing: 15ms, uniform regardless of
                    // arsis/thesis - see docs/PROVENANCE.md, Thesis/Arsis
                    // marking, "Foot-separation timing bug," for the fix
                    // and why (fabricated-citation comments removed).
                    const footSeparationTime = verse.arsisThesisPattern
                                               ? 15
                                               : 15;
                    currentTime += footSeparationTime;
                    
                    // Add foot boundary pause if specified
                    // DELIBERATELY DISABLED - see full explanation at
                    // server/services/midi-generator.ts:1655 (doubled foot-boundary
                    // pauses).
                    if (verse.pauseAfter && verse.pauseAfter[syllableIndex - 1]) {
                        //currentTime += verse.pauseAfter[syllableIndex - 1];
                    }
                }
            }
            
            // Add verse separation timing (changed to 120 to match metronome track)
            currentTime += 120;
        }
        
        return {
            channel:    9,
            instrument: 0,
            events,
        };
    }
    
    private hasAcuteAccent(verse: ProcessedVerse, index: number): boolean {
        if (
            !verse.accentTablature ||
            index < 0 ||
            index >= verse.accentTablature.length
        ) {
            return !1;
        }
        return verse.accentTablature[index] >= 1.0;
    }
    
    private createVocalGuideTrack(
        processedVerses: ProcessedVerse[],
        mode: keyof typeof this.modes,
        experimental?: any,
        allowMelody?: boolean,
    ): MidiTrack {
        const events: MidiEvent[] = [];
        let currentTime = 0;
        const scale = allowMelody
                      ? [this.modes[mode][0], this.modes[mode][this.modes[mode].length - 1]]
                      : this.modes[mode];
        
        events.push({
                        type: "program_change",
                        time: 0,
                        data: [91],
                    }); // Pad 8 (synth pad)
        
        for (const verse of processedVerses) {
            const durations = verse.durationTablature;
            
            // Use metrical foot structure
            if (verse.metricPatterns?.length > 0) {
                let syllableIndex = 0;
                
                // Loop through each metrical foot
                for (
                    let footIndex = 0;
                    footIndex < verse.metricPatterns.length;
                    footIndex++
                ) {
                    const footPattern = verse.metricPatterns[footIndex];
                    const footDurations = footPattern.durations || [1.0];
                    
                    // Process each syllable within this foot
                    for (
                        let positionInFoot = 0;
                        positionInFoot < footDurations.length;
                        positionInFoot++
                    ) {
                        if (syllableIndex >= durations.length) break;
                        
                        const duration = durations[syllableIndex];
                        const length = this.calculateNoteLength(
                            duration,
                            syllableIndex,
                            verse,
                            experimental,
                            allowMelody,
                        );
                        
                        // Motta's vocal guide rules:
                        // 1. Only guide notes on syllables with duration >= 1.0
                        // 2. Add percussive marker on durational ratio > 1.8
                        if (duration >= 1.0) {
                            const guideStart = currentTime + 25; // Sync with metronome click delay
                            const guideLength = Math.min(48,
                                                         Math.floor(length * 0.33)); // Shorter than melodic notes
                            
                            const pitchIndex =
                                      positionInFoot === 0
                                      ? 0 // Strong tonic on foot start
                                      : Math.min(scale.length - 1,
                                                 positionInFoot + 1);
                            
                            const note = 60 + scale[pitchIndex];
                            const velocity = 30 + Math.min(90,
                                                           Math.round(duration * 15));
                            
                            events.push(
                                {
                                    type: "note_on",
                                    time: guideStart,
                                    data: [note, velocity],
                                },
                                {
                                    type: "note_off",
                                    time: guideStart + guideLength,
                                    data: [note, 0],
                                },
                            );
                            
                            // Durational ratio marker (sync with accent track)
                            if (
                                syllableIndex > 0 &&
                                duration / durations[syllableIndex - 1] > 1.8
                            ) {
                                events.push(
                                    {
                                        type: "note_on",
                                        time: guideStart - 25,
                                        data: [35, 70], // Acoustic bass drum
                                    },
                                    {
                                        type: "note_off",
                                        time: guideStart + 25,
                                        data: [35, 0],
                                    },
                                );
                            }
                        }
                        
                        currentTime += length;
                        syllableIndex++;
                    }
                    
                    // Sync foot separation with other tracks: 15ms,
                    // uniform regardless of arsis/thesis. Was asymmetric
                    // (15 vs -65, a swing of 80ms/foot ) - this was the
                    // actual cause of the audible slowdown whenever
                    // arsis/thesis was enabled. Fixed - see
                    // docs/PROVENANCE.md, Thesis/Arsis marking,
                    // "Foot-separation timing bug." Fabricated-citation
                    // comments ("anaklasis", "synaesthesia", Elementa
                    // II.22) removed - unverifiable, not found in any
                    // source checked this project.
                    currentTime += verse.arsisThesisPattern
                                   ? 15
                                   : 15;
                    
                    // Handle pauseAfter
                    // DELIBERATELY DISABLED - see full explanation at
                    // server/services/midi-generator.ts:1655 (doubled foot-boundary
                    // pauses).
                    if (verse.pauseAfter?.[syllableIndex - 1]) {
                        //currentTime += verse.pauseAfter[syllableIndex - 1];
                    }
                }
            }
            
            // Verse separation (reduced from 120 to match rhythmic phrasing)
            currentTime += 120;
        }
        
        return {
            channel:    8,
            instrument: 91,
            events,
        };
    }
    
    private createAntiphonalResponseTrack(
        processedVerses: ProcessedVerse[],
        instrument: keyof typeof this.instruments,
        mode: keyof typeof this.modes,
        experimental?: any,
    ): MidiTrack {
        const events: MidiEvent[] = [];
        let currentTime = 0;
        const responseChannel = 2;
        
        // CONTEXT ONLY: ancient dramatic exchange and accompaniment support
        // a responsive theatrical layer; the aulos choice, response delay,
        // patterns, pitches, and velocities below are application choices.
        // See PROVENANCE, "Antiochene scenic listening model: evidence and
        // limits."
        const responseInstrument = this.instruments.aulos;
        
        // Response patterns should mirror the metrical identity
        const responsePatterns: Record<
            string,
            { rhythm: number[]; notes: number[] }
        > = {
            dactyl:  {
                rhythm: [1.2, 0.6, 0.6],
                notes:  [0, 2, 4],
            },
            anapest: {
                rhythm: [0.6, 0.6, 1.2],
                notes:  [4, 2, 0],
            },
            spondee: {
                rhythm: [1.5, 1.5],
                notes:  [0, 5],
            },
            iamb:    {
                rhythm: [0.8, 1.2],
                notes:  [7, 4],
            },
            trochee: {
                rhythm: [1.2, 0.8],
                notes:  [4, 2],
            },
            default: {
                rhythm: [1.0, 1.0, 0.5, 0.5],
                notes:  [0, 4, 7, 4],
            },
        };
        
        events.push({
                        type: "program_change",
                        time: 0,
                        data: [responseInstrument],
                    });
        
        for (const verse of processedVerses) {
            let callDuration = 0;
            const verseResponseEvents: MidiEvent[] = [];
            
            if (verse.metricPatterns?.length > 0) {
                for (const foot of verse.metricPatterns) {
                    callDuration += foot.durations.reduce(
                        (sum, dur) =>
                            sum +
                            this.calculateNoteLength(dur,
                                                     0,
                                                     verse,
                                                     experimental,
                                                     false),
                        0,
                    );
                }
            } else {
                callDuration = verse.durationTablature.reduce(
                    (sum, dur, idx) =>
                        sum +
                        this.calculateNoteLength(dur,
                                                 idx,
                                                 verse,
                                                 experimental,
                                                 false),
                    0,
                );
            }
            
            // Increase delay before response (780ms instead of 480ms)
            let responseTime = currentTime + callDuration + 780;
            
            if (verse.metricPatterns?.length > 0) {
                for (const foot of verse.metricPatterns) {
                    const footType = this.identifyFootForResponse(foot.durations);
                    const pattern =
                              responsePatterns[footType] || responsePatterns.default;
                    const baseNote = 60 + this.modes[mode][0]; // Modal tonic
                    
                    for (let i = 0; i < pattern.rhythm.length; i++) {
                        const length = this.calculateNoteLength(
                            pattern.rhythm[i],
                            0,
                            verse,
                            experimental,
                            false,
                        );
                        
                        const note = baseNote + pattern.notes[i % pattern.notes.length];
                        const velocity = 50 + Math.floor(Math.random() * 20); // Expressive variation
                        
                        verseResponseEvents.push(
                            {
                                type: "note_on",
                                time: responseTime,
                                data: [note, velocity],
                            },
                            {
                                type: "note_off",
                                time: responseTime + length - 10,
                                data: [note, 0],
                            },
                        );
                        
                        responseTime += length;
                    }
                    
                    // Subtle pause between feet
                    responseTime += 20 + Math.floor(Math.random() * 30);
                }
            }
            
            events.push(...verseResponseEvents);
            currentTime = responseTime + 240; // Time before next verse response
        }
        
        return {
            channel:    responseChannel,
            instrument: responseInstrument,
            events,
        };
    }
    
    private identifyFootForResponse(durations: number[]): string {
        if (!durations || durations.length === 0) return "default";
        
        const sum = durations.reduce((a, b) => a + b,
                                     0);
        const avg = sum / durations.length;
        
        if (durations.length === 3) {
            const [a, b, c] = durations;
            if (a > avg && b < avg && c < avg) return "dactyl";
            if (a < avg && b < avg && c > avg) return "anapest";
        } else if (durations.length === 2) {
            const [a, b] = durations;
            if (a < b) return "iamb";
            if (a > b) return "trochee";
            if (Math.abs(a - b) < 0.2) return "spondee";
        }
        
        return "default";
    }
    
    // hydraulis and scabellum below are cited to real ancient sources (see
    // docs/PROVENANCE.md) but currently UNREACHABLE: `instrument` is typed
    // by shared/schema.ts's Zod enum, which does not include either key, so
    // no live call path can select them. They are not, and will not become,
    // options in the main instrument selector -- if surfaced at all, it
    // will be as an antiochene_scenic-scoped option, not a general
    // instrument choice. See PROVENANCE, "Vitruvius: hydraulis and theater
    // acoustics" and "Seneca: scabellum."
    private pantomimeInstruments = {
        ...this.instruments,
        tympanon: 117, // Frame drum with sustain
        crotala:  115, // Resonant bronze clappers
        // Hall and Wyles (eds.), New Directions in Ancient Pantomime,
        // pp.25–27: the scabellum marks the pulse in pantomime context.
        // GM patch 76 is an arbitrary modern MIDI program choice, not a
        // reconstruction of the historical instrument.
        scabellum: 76,
        // Vitruvius, De Architectura X.viii ("De hydraulicis," "On Water
        // Organs"), full chapter on hand and verified directly: describes
        // the hydraulis (water organ) mechanism in detail -- bronze
        // cylinders, pistons, valved "dolphins," the air-vessel ("pnigeus"),
        // and the "canon musicus" pipe rack (tetrachord/hexachord/octochord
        // depending on register count). GM patch 19 (an organ-family patch)
        // is an arbitrary modern MIDI program choice, not itself sourced.
        hydraulis: 19,
    };
    
    private modeToPantomime = {
        dorian:       {
            velocity:       90,
            channel:        3,
            rhythm:         [1.0, 1.0],
            bodyMovement:   "σεμνός",
            gesturePattern: [0, 0, 1, 0],
        },
        phrygian:     {
            velocity:       100,
            channel:        4,
            rhythm:         [0.5, 0.5, 0.5, 1.5],
            bodyMovement:   "ἐνθουσιώδης",
            gesturePattern: [1, 0, 1, 1],
        },
        lydian:       {
            velocity:       85,
            channel:        5,
            rhythm:         [0.75, 0.75, 1.5],
            bodyMovement:   "μαλακός",
            gesturePattern: [1, 0, 0],
        },
        mixolydian:   {
            velocity:       90,
            channel:        6,
            rhythm:         [0.75, 1.0, 0.75],
            bodyMovement:   "καθαρός",
            gesturePattern: [1, 1, 0],
        },
        aeolian:      {
            velocity:       80,
            channel:        7,
            rhythm:         [1.0, 1.0, 1.0],
            bodyMovement:   "λυπημένος",
            gesturePattern: [0, 1, 0],
        },
        hypolydian:   {
            velocity:       95,
            channel:        8,
            rhythm:         [0.5, 1.0, 1.5],
            bodyMovement:   "θριαμβευτικός",
            gesturePattern: [1, 0, 1],
        },
        hypophrygian: {
            velocity:       105,
            channel:        10,
            rhythm:         [0.5, 0.5, 1.0],
            bodyMovement:   "μανιακός",
            gesturePattern: [1, 1, 1],
        },
        hypodorian:   {
            velocity:       90,
            channel:        11,
            rhythm:         [1.0, 0.5, 0.5],
            bodyMovement:   "τάφος",
            gesturePattern: [0, 0, 1],
        },
    };
    
    private createPantomimeTrack(
        processedVerses: ProcessedVerse[],
        instrument: keyof typeof this.pantomimeInstruments,
        mode: keyof typeof this.modes,
        experimental?: any,
        allowMelody?: boolean,
    ): MidiTrack {
        const events: MidiEvent[] = [];
        let currentTime = 0;
        const config = this.modeToPantomime[mode];
        
        // Initialize instrument (20% quieter than main track)
        events.push({
                        type: "program_change",
                        time: 0,
                        data: [this.pantomimeInstruments[instrument]],
                    });
        
        for (const verse of processedVerses) {
            const durations = verse.durationTablature;
            
            // Process the same parsed foot structure as the main rhythm track.
            if (verse.metricPatterns?.length > 0) {
                let syllableIndex = 0;
                
                for (const footPattern of verse.metricPatterns) {
                    const footDurations = footPattern.durations || [1.0];
                    
                    for (
                        let positionInFoot = 0;
                        positionInFoot < footDurations.length;
                        positionInFoot++
                    ) {
                        if (syllableIndex >= durations.length) break;
                        
                        const duration = durations[syllableIndex];
                        let length = this.calculateNoteLength(
                            duration,
                            syllableIndex,
                            verse,
                            experimental,
                            allowMelody,
                        );
                        
                        // Interpretative pantomime-specific timing adjustment.
                        // With arsis/thesis input, this pantomime branch applies an
                        // additional symbol multiplier after calculateNoteLength();
                        // it does not mirror the main rhythm track's timing exactly.
                        if (verse.arsisThesisPattern && footPattern.foot) {
                            const metricalSymbol = footPattern.foot[positionInFoot];
                            if (metricalSymbol === "U") length = Math.round(length * 0.5);
                            else if (metricalSymbol === "-")
                                length = Math.round(length);
                            else if (metricalSymbol === "X")
                                length = Math.round(length * 0.75);
                            length = Math.max(120,
                                              length);
                        }
                        
                        // Add note (quieter than main track)
                        const isAccent =
                                  config.gesturePattern[
                                  syllableIndex % config.gesturePattern.length
                                      ] === 1;
                        const velocity = Math.min(
                            127,
                            Math.round(config.velocity * 0.8 * (
                                isAccent ? 1.1 : 1
                            )),
                        );
                        
                        events.push(
                            {
                                type: "note_on",
                                time: currentTime + 10,
                                data: [this.pantomimeInstruments[instrument], velocity],
                            },
                            {
                                type: "note_off",
                                time: currentTime + length - 10,
                                data: [this.pantomimeInstruments[instrument], 0],
                            },
                        );
                        
                        currentTime += length;
                        syllableIndex++;
                    }
                    
                    // No additional inter-foot separation is applied here.
                    //currentTime += verse.arsisThesisPattern ? 40 : 20;
                    
                    // DELIBERATELY DISABLED - see full explanation at
                    // server/services/midi-generator.ts:1655 (doubled foot-boundary
                    // pauses).
                    if (verse.pauseAfter?.[syllableIndex - 1]) {
                        //currentTime += verse.pauseAfter[syllableIndex - 1];
                    }
                }
            } else {
                // Fallback uses the main track's calculateNoteLength() route.
                durations.forEach((duration, index) => {
                    const length = this.calculateNoteLength(
                        duration,
                        index,
                        verse,
                        experimental,
                        allowMelody,
                    );
                    const velocity = Math.min(127,
                                              Math.round(config.velocity * 0.8));
                    
                    events.push(
                        {
                            type: "note_on",
                            time: currentTime + 10,
                            data: [this.pantomimeInstruments[instrument], velocity],
                        },
                        {
                            type: "note_off",
                            time: currentTime + length - 10,
                            data: [this.pantomimeInstruments[instrument], 0],
                        },
                    );
                    
                    currentTime += length;
                });
            }
            
            currentTime += 120; // Same verse separation
        }
        
        return {
            channel:    config.channel,
            instrument: this.pantomimeInstruments[instrument],
            events,
        };
    }
    
    private addAntiocheneOrnamentation(
        events: MidiEvent[],
        verse: ProcessedVerse,
        index: number,
        baseNote: number,
        currentTime: number,
        length: number,
        instrument: keyof typeof this.instruments,
        velocity: number,
    ) {
        // CONTEXT ONLY: ancient melisma is documented generally, but no
        // reviewed source supplies these pitches or timings. The caller owns
        // the base-note pair; this helper adds this application's
        // interpretative ornaments only. See PROVENANCE, "Antiochene scenic
        // listening model: evidence and limits."
        
        // ORNAMENTAL VOICE (Choricius' παραμέλματα)
        if (verse.durationTablature[index] >= 1.0) {
            const ornamentNote = baseNote + 5; // Perfect 4th (Syrian "διὰ τεσσάρων")
            const ornamentVelocity = velocity * 0.6;
            
            // A) DELAYED ENTRY (20% into note)
            events.push({
                            type: "note_on",
                            time: currentTime + length * 0.2,
                            data: [ornamentNote, ornamentVelocity],
                        });
            
            // B) CADENTIAL MOTION (60-90% of note)
            if (index === verse.durationTablature.length - 1) {
                events.push(
                    {
                        type: "note_on",
                        time: currentTime + length * 0.6,
                        data: [ornamentNote - 2, ornamentVelocity * 0.9], // Whole step down
                    },
                    {
                        type: "note_off",
                        time: currentTime + length * 0.8,
                        data: [ornamentNote - 2, 0],
                    },
                    {
                        type: "note_on",
                        time: currentTime + length * 0.8,
                        data: [ornamentNote - 4, ornamentVelocity * 0.8], // Minor third down
                    },
                    {
                        type: "note_off",
                        time: currentTime + length * 0.9,
                        data: [ornamentNote - 4, 0],
                    },
                );
            }
            
            // C) RELEASE (90% of duration)
            events.push({
                            type: "note_off",
                            time: currentTime + length * 0.9,
                            data: [ornamentNote, 0],
                        });
        }
    }
    
    // REMOVED: addPtolemaicOrnamentation, addNicomacheanOrnamentation --
    // confirmed zero live callers, archived to REMOVED_FUNCTIONS.text.
    
    
    private createMusicXml(track: MidiTrack, tempo: number, instrument: string): string {
        const activeNotes = new Map<number, Array<{ start: number; velocity: number }>>();
        const notes: Array<{ pitch: number; start: number; end: number; velocity: number; voice: number }> = [];
        const events = [...track.events].sort((a, b) =>
                                                  a.time - b.time || (
                                                             a.type === "note_off" ? -1 : 1
                                                         ),
        );
        
        for (const event of events) {
            if (event.type === "note_on" && event.data[1] > 0) {
                const queue = activeNotes.get(event.data[0]) || [];
                queue.push({
                               start:    event.time,
                               velocity: event.data[1],
                           });
                activeNotes.set(event.data[0],
                                queue);
            } else if (event.type === "note_off" || (
                event.type === "note_on" && event.data[1] === 0
            )) {
                const queue = activeNotes.get(event.data[0]);
                const started = queue?.shift();
                if (started && event.time > started.start) {
                    notes.push({
                                   pitch:    event.data[0],
                                   start:    started.start,
                                   end:      event.time,
                                   velocity: started.velocity,
                                   voice:    1,
                               });
                }
            }
        }
        
        notes.sort((a, b) => a.start - b.start || a.end - b.end);
        const voiceEnds: number[] = [];
        for (const note of notes) {
            const availableVoice = voiceEnds.findIndex(end => end <= note.start);
            const voiceIndex = availableVoice === -1 ? voiceEnds.length : availableVoice;
            voiceEnds[voiceIndex] = note.end;
            note.voice = voiceIndex + 1;
        }
        
        const divisions = 480;
        const measureLength = divisions * 4;
        const lastTick = Math.max(measureLength,
                                  ...notes.map(note => note.end));
        const measureCount = Math.ceil(lastTick / measureLength);
        const measureXml: string[] = [];
        for (let measureIndex = 0; measureIndex < measureCount; measureIndex++) {
            const measureStart = measureIndex * measureLength;
            const measureEnd = measureStart + measureLength;
            const voicesXml: string[] = [];
            for (let voice = 1; voice <= Math.max(1,
                                                  voiceEnds.length); voice++) {
                const fragments = notes
                .filter(note => note.voice === voice && note.start < measureEnd && note.end > measureStart)
                .map(note => (
                    {
                        ...note,
                        start:                 Math.max(note.start,
                                                        measureStart),
                        end:                   Math.min(note.end,
                                                        measureEnd),
                        continuesFromPrevious: note.start < measureStart,
                        continuesIntoNext:     note.end > measureEnd,
                    }
                ))
                .sort((a, b) => a.start - b.start);
                let cursor = measureStart;
                const entries: string[] = [];
                for (const fragment of fragments) {
                    if (fragment.start > cursor) {
                        entries.push(this.musicXmlRest(fragment.start - cursor,
                                                       voice));
                    }
                    entries.push(this.musicXmlNote(fragment));
                    cursor = fragment.end;
                }
                if (cursor < measureEnd) entries.push(this.musicXmlRest(measureEnd - cursor,
                                                                        voice));
                voicesXml.push((
                                   voice > 1 ? `<backup><duration>${measureLength}</duration></backup>` : ""
                               ) + entries.join(""));
            }
            const attributes = measureIndex === 0
                               ? `<attributes><divisions>${divisions}</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes><direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome></direction-type><sound tempo="${tempo}"/></direction>`
                               : "";
            measureXml.push(`<measure number="${measureIndex + 1}">${attributes}${voicesXml.join("")}</measure>`);
        }
        
        // noinspection HttpUrlsUsage
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd"><score-partwise version="3.1"><work><work-title>Generated application score</work-title></work><identification><encoding><software>Ancient Greek Verse to Music Composer</software></encoding></identification><part-list><score-part id="P1"><part-name>${this.escapeMusicXml(instrument)}</part-name></score-part></part-list><part id="P1">${measureXml.join("")}</part></score-partwise>`;
    }
    
    private musicXmlRest(duration: number, voice: number): string {
        return `<note><rest/><duration>${duration}</duration><voice>${voice}</voice>${this.musicXmlWrittenType(duration)}</note>`;
    }

    // MusicXML <duration> values retain the application's integer MIDI-tick
    // timing at 480 divisions per quarter. A conventional written note type
    // is added only when that exact duration has one; arbitrary application
    // microtimings must not be falsely engraved as quarter notes.
    private musicXmlWrittenType(duration: number): string {
        const baseTypes: Array<[number, string]> = [
            [1920, "whole"],
            [960, "half"],
            [480, "quarter"],
            [240, "eighth"],
            [120, "16th"],
            [60, "32nd"],
            [30, "64th"],
            [15, "128th"],
        ];
        for (const [baseDuration, type] of baseTypes) {
            for (let dots = 0; dots <= 3; dots++) {
                const multiplier = 2 - 1 / (2 ** dots);
                if (duration === baseDuration * multiplier) {
                    return `<type>${type}</type>${"<dot/>".repeat(dots)}`;
                }
            }
        }
        return "";
    }
    
    private musicXmlNote(note: {
        pitch: number;
        start: number;
        end: number;
        velocity: number;
        voice: number;
        continuesFromPrevious: boolean;
        continuesIntoNext: boolean
    }): string {
        const pitchClasses = [
            ["C", 0], ["C", 1], ["D", 0], ["D", 1], ["E", 0], ["F", 0],
            ["F", 1], ["G", 0], ["G", 1], ["A", 0], ["A", 1], ["B", 0],
        ] as const;
        const pitchClass = pitchClasses[(
                                            (
                                                note.pitch % 12
                                            ) + 12
                                        ) % 12];
        const octave = Math.floor(note.pitch / 12) - 1;
        const ties = `${note.continuesFromPrevious ? '<tie type="stop"/>' : ""}${note.continuesIntoNext ? '<tie type="start"/>' : ""}`;
        const tieNotations = note.continuesFromPrevious || note.continuesIntoNext
                             ? `<notations>${note.continuesFromPrevious ? '<tied type="stop"/>' : ""}${note.continuesIntoNext ? '<tied type="start"/>' : ""}</notations>`
                             : "";
        const duration = note.end - note.start;
        return `<note>${ties}<pitch><step>${pitchClass[0]}</step>${pitchClass[1] ? `<alter>${pitchClass[1]}</alter>` : ""}<octave>${octave}</octave></pitch><duration>${duration}</duration><voice>${note.voice}</voice>${this.musicXmlWrittenType(duration)}<velocity>${note.velocity}</velocity>${tieNotations}</note>`;
    }
    
    private escapeMusicXml(value: string): string {
        return value.replace(/[<>&"']/g,
                             character => (
                                              {
                                                  "<": "&lt;",
                                                  ">": "&gt;",
                                                  "&": "&amp;",
                                                  '"': "&quot;",
                                                  "'": "&apos;",
                                              }
                                          )[character] || character);
    }
    
    // Assembles the final binary .midi file: header chunk + a dedicated
    // tempo track + one MTrk chunk per generated track. Standard MIDI
    // Format 1 (multi-track, synchronous) structure.
    private assembleMidiFile(tracks: MidiTrack[], tempo: number): Buffer {
        const chunks: Buffer[] = [];
        chunks.push(this.createHeaderChunk(tracks.length));
        chunks.push(this.createTempoTrack(tempo));
        for (const track of tracks) {
            chunks.push(this.createTrackChunk(track));
        }
        return Buffer.concat(chunks);
    }
    
    // SOURCE: none - Standard MIDI File (SMF) format specification, not an
    // academic/classical source. See assembleMidiFile above.
    // Standard SMF header chunk (MThd): format 1 (numTracks+1 for the
    // dedicated tempo track), 480 ticks per quarter note (the tick
    // resolution every duration calculation in this file assumes -
    // calculateNoteLength etc. convert to/from this 480 base throughout).
    private createHeaderChunk(numTracks: number): Buffer {
        const header = Buffer.alloc(14);
        let offset = 0;
        header.write("MThd",
                     offset);
        offset += 4;
        header.writeUInt32BE(6,
                             offset);
        offset += 4;
        header.writeUInt16BE(1,
                             offset);
        offset += 2;
        header.writeUInt16BE(numTracks + 1,
                             offset);
        offset += 2;
        header.writeUInt16BE(480,
                             offset);
        return header;
    }
    
    // SOURCE: none - SMF format specification (tempo meta-event encoding).
    // Dedicated MTrk chunk carrying only the tempo meta-event (converts
    // BPM to microseconds-per-quarter-note) plus an end-of-track marker.
    // Kept separate from the musical tracks so every track shares one
    // tempo map, per the SMF Format 1 convention.
    private createTempoTrack(tempo: number): Buffer {
        const events: Buffer[] = [];
        const microsecondsPerQuarter = Math.round(60000000 / tempo);
        const tempoEvent = Buffer.concat([
                                             Buffer.from([0x00, 0xff, 0x51, 0x03]),
                                             Buffer.from([
                                                             (
                                                                 microsecondsPerQuarter >> 16
                                                             ) & 0xff,
                                                             (
                                                                 microsecondsPerQuarter >> 8
                                                             ) & 0xff,
                                                             microsecondsPerQuarter & 0xff,
                                                         ]),
                                         ]);
        events.push(tempoEvent);
        events.push(Buffer.from([0x00, 0xff, 0x2f, 0x00]));
        const trackData = Buffer.concat(events);
        const trackHeader = Buffer.alloc(8);
        trackHeader.write("MTrk",
                          0);
        trackHeader.writeUInt32BE(trackData.length,
                                  4);
        return Buffer.concat([trackHeader, trackData]);
    }
    
    // SOURCE: none - SMF format specification (event/delta-time encoding).
    // Converts one MidiTrack's events (absolute-time note_on/note_off/etc.,
    // as built by createRhythmTrack and friends) into a real MTrk chunk:
    // delta-times, per-event-type binary encoding, variable-length
    // quantities (see encodeVariableLength below).
    private createTrackChunk(track: MidiTrack): Buffer {
        const events: Buffer[] = [];
        let lastTime = 0;
        for (const event of track.events) {
            const deltaTime = Math.max(0,
                                       event.time - lastTime);
            let eventBytes: Buffer;
            switch (event.type) {
                case "note_on":
                    eventBytes = Buffer.from([
                                                 0x90 | track.channel,
                                                 event.data[0],
                                                 event.data[1],
                                             ]);
                    break;
                case "note_off":
                    eventBytes = Buffer.from([
                                                 0x80 | track.channel,
                                                 event.data[0],
                                                 event.data[1],
                                             ]);
                    break;
                case "program_change":
                    eventBytes = Buffer.from([0xc0 | track.channel, event.data[0]]);
                    break;
                case "pitch_bend":
                    eventBytes = Buffer.from([
                                                 0xe0 | track.channel,
                                                 event.data[0],
                                                 event.data[1],
                                             ]);
                    break;
                default:
                    continue;
            }
            const deltaTimeBytes = this.encodeVariableLength(deltaTime);
            events.push(Buffer.concat([deltaTimeBytes, eventBytes]));
            lastTime = event.time;
        }
        events.push(Buffer.from([0x00, 0xff, 0x2f, 0x00]));
        const trackData = Buffer.concat(events);
        const trackHeader = Buffer.alloc(8);
        trackHeader.write("MTrk",
                          0);
        trackHeader.writeUInt32BE(trackData.length,
                                  4);
        return Buffer.concat([trackHeader, trackData]);
    }
    
    private encodeVariableLength(value: number): Buffer {
        const bytes: number[] = [];
        bytes.push(value & 0x7f);
        while (value > 0x7f) {
            value >>= 7;
            bytes.unshift((
                              value & 0x7f
                          ) | 0x80);
        }
        return Buffer.from(bytes);
    }
    
    private getFootIndex(syllableIndex: number, verse: ProcessedVerse): number {
        for (let i = 0; i < verse.footBoundaries.length; i++) {
            if (syllableIndex <= verse.footBoundaries[i]) {
                return i;
            }
        }
        return verse.footBoundaries.length - 1;
    }
    
    private getPositionInFoot(
        syllableIndex: number,
        verse: ProcessedVerse,
    ): number {
        const footIndex = this.getFootIndex(syllableIndex,
                                            verse);
        const footStart =
                  footIndex === 0 ? 0 : verse.footBoundaries[footIndex - 1] + 1;
        return syllableIndex - footStart;
    }
    
    private getFootAwareNote(
        syllableIndex: number,
        verse: ProcessedVerse,
        scale: number[],
        baseNote: number,
        allowMelody: boolean,
    ): number {
        if (!verse.footBoundaries || verse.footBoundaries.length === 0) {
            return allowMelody
                   ? baseNote + scale[syllableIndex % scale.length] - scale[0]
                   : baseNote + scale[syllableIndex % 2] - scale[0];
        }
        const footIndex = this.getFootIndex(syllableIndex,
                                            verse);
        const positionInFoot = this.getPositionInFoot(syllableIndex,
                                                      verse);
        if (allowMelody) {
            const footPattern = verse.metricPatterns[footIndex];
            if (footPattern) {
                const patternIndex = (
                                         footIndex * 3 + positionInFoot
                                     ) % scale.length;
                return baseNote + scale[patternIndex] - scale[0];
            }
        } else {
            const noteIndex = positionInFoot === 0 ? 1 : 0;
            return baseNote + scale[noteIndex] - scale[0];
        }
        return baseNote;
    }
}
