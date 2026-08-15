// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import 'dotenv/config';

export interface MetricalPattern {
    foot: string;
    durations: number[];
    accents: number[];
}

export interface ProcessedVerse {
    text: string;
    originalMetrics: string;
    metricPatterns: MetricalPattern[];
    durationTablature: number[];
    accentTablature: number[];
    syllableCount: number;
    footBoundaries: number[];
    arsisThesisPattern?: string;
    pauseAfter?: Record<number, number>;
    acuteAccentTablature?: boolean[];
}

export interface ExperimentalSettings {
    baseUnit?: number; // chronos protos in ms
}

export class MetricalAnalysisService {
    // SOURCE: base long:short ratio verified against Aristoxenus, Elementa
    // Rhythmica II.30 (Marchetti trans., p.74) and the anceps value against
    // Elementa Rhythmica §20 (Lynch 2020 gloss) - see docs/PROVENANCE.md.
    // long=1.0, short=0.5 here is the same verified 2:1 ("double"/iambic
    // genus) ratio as midi-generator.ts's long=2/short=1 - different
    // absolute base unit, same ratio. Foot names are standard
    // classical-metrics nomenclature, not individually cited. The
    // standalone "X" (anceps) entry and every compound anceps pattern
    // ("X-", "-X", etc.) below use 0.75 - the correctly-scaled equivalent
    // of Aristoxenus' irrational khoreios upbeat value (1.5 in
    // midi-generator.ts's long=2/short=1 scale; see isAnceps() there).
    //
    // Complete metrical patterns mapping based on Marcus Mota's research methodology
    // and comprehensive ancient Greek prosody
    private readonly metricalPatterns: Record<
        string,
        { duration: number[]; accent: number[] }
    > = {
        // === BASIC ELEMENTS ===
        // Single syllables
        "-": {
            duration: [1.0],
            accent:   [1],
        }, // Long syllable (longum)
        U:   {
            duration: [0.5],
            accent:   [0],
        }, // Short syllable (breve)
        X:   {
            duration: [0.75],
            accent:   [0.5],
        }, // Anceps (free position - can be long or short)
        
        // === TWO-SYLLABLE FEET ===
        // Iamb and Trochee
        "U-": {
            duration: [0.5, 1.0],
            accent:   [0, 1],
        }, // Iamb (rising rhythm)
        "-U": {
            duration: [1.0, 0.5],
            accent:   [1, 0],
        }, // Trochee (falling rhythm)
        "--": {
            duration: [1.0, 1.0],
            accent:   [1, 0],
        }, // Spondee (two long)
        UU:   {
            duration: [0.5, 0.5],
            accent:   [0, 0],
        }, // Pyrrhic (two short)
        
        // === THREE-SYLLABLE FEET ===
        // Dactylic family
        "-UU": {
            duration: [1.0, 0.5, 0.5],
            accent:   [1, 0, 0],
        }, // Dactyl
        "U--": {
            duration: [0.5, 1.0, 1.0],
            accent:   [0, 1, 0],
        }, // Antidactyl - same shape as the metrical bacchius (short-long-long)
        "UU-": {
            duration: [0.5, 0.5, 1.0],
            accent:   [0, 0, 1],
        }, // Anapaest
        "--U": {
            duration: [1.0, 1.0, 0.5],
            accent:   [1, 0, 0],
        }, // Anti-anapaest - same shape as the metrical antibacchius (long-long-short)
        
        // Amphibrach family
        "U-U": {
            duration: [0.5, 1.0, 0.5],
            accent:   [0, 1, 0],
        }, // Amphibrach
        "-U-": {
            duration: [1.0, 0.5, 1.0],
            accent:   [1, 0, 0],
        }, // Cretic (amphimacer) - same shape as the metrical palimbacchius (long-short-long)
        UUU:   {
            duration: [0.5, 0.5, 0.5],
            accent:   [0, 0, 0],
        }, // Tribrach
        "---": {
            duration: [1.0, 1.0, 1.0],
            accent:   [1, 0, 1],
        }, // Molossus
        
        // === FOUR-SYLLABLE FEET ===
        // Paeon family (one long, three short in various positions)
        "-UUU": {
            duration: [1.0, 0.5, 0.5, 0.5],
            accent:   [1, 0, 0, 0],
        }, // First Paeon
        "U-UU": {
            duration: [0.5, 1.0, 0.5, 0.5],
            accent:   [0, 1, 0, 0],
        }, // Second Paeon
        "UU-U": {
            duration: [0.5, 0.5, 1.0, 0.5],
            accent:   [0, 0, 1, 0],
        }, // Third Paeon
        "UUU-": {
            duration: [0.5, 0.5, 0.5, 1.0],
            accent:   [0, 0, 0, 1],
        }, // Fourth Paeon
        
        // Ionic family
        "UU--": {
            duration: [0.5, 0.5, 1.0, 1.0],
            accent:   [0, 0, 1, 0],
        }, // Ionic a minore
        "--UU": {
            duration: [1.0, 1.0, 0.5, 0.5],
            accent:   [1, 0, 0, 0],
        }, // Ionic a maiore
        
        // Choriamb and related
        "-UU-": {
            duration: [1.0, 0.5, 0.5, 1.0],
            accent:   [1, 0, 0, 1],
        }, // Choriamb - same shape as Lynch's rhythmical "Bacchius 2"
           // (trochee+iamb compound) - "Rhythmics" (2020) - see
           // docs/PROVENANCE.md, "Rhythm: rhythmical bacchius."
        "U--U": {
            duration: [0.5, 1.0, 1.0, 0.5],
            accent:   [0, 1, 0, 0],
        }, // Antispast - same shape as Lynch's rhythmical "Bacchius 1"
           // (iamb+trochee compound) - "Rhythmics" (2020) - see
           // docs/PROVENANCE.md, "Rhythm: rhythmical bacchius."
        
        // Epitrite family (three long, one short in various positions).
        // Metrical epitrite - Lynch, "Rhythmics" (2020), n.29, citing
        // Aristides Quintilianus, De Musica 45.5-11: "various
        // combinations of one short and three long syllables" - see
        // docs/PROVENANCE.md, "Rhythm: metrical epitrites."
        "U---": {
            duration: [0.5, 1.0, 1.0, 1.0],
            accent:   [0, 1, 0, 1],
        }, // First Epitrite
        "-U--": {
            duration: [1.0, 0.5, 1.0, 1.0],
            accent:   [1, 0, 1, 0],
        }, // Second Epitrite
        "--U-": {
            duration: [1.0, 1.0, 0.5, 1.0],
            accent:   [1, 0, 0, 1],
        }, // Third Epitrite
        "---U": {
            duration: [1.0, 1.0, 1.0, 0.5],
            accent:   [1, 0, 1, 0],
        }, // Fourth Epitrite
        
        // Four short syllables
        UUUU: {
            duration: [0.5, 0.5, 0.5, 0.5],
            accent:   [0, 0, 0, 0],
        }, // Proceleusmatic
        
        // === FIVE+ SYLLABLE FEET ===
        // DOCHMIAC -- two separately-keyed entries below, both real. Verse
        // input is space-separated into discrete feet (see parseMetrics()/
        // parseMetrics_OLD() above), and each space-separated foot is
        // looked up as an exact dictionary key against this table -- there
        // is no scanning or overlap between keys, so multiple attested
        // dochmiac shapes can coexist safely as long as each has its own
        // distinct key string. Real ancient dochmiacs have more than one
        // attested surface realization (see Lynch's "resolved variants"
        // note below), so representing more than one here, rather than
        // picking a single "correct" shape, better matches the sources.
        //
        // "U--U-": short-long-long-short-long, supported by two compatible
        // accounts of the same paradigm:
        // - Lynch (2020), via DAGM 3 (an actual notated ancient score):
        //   the attested rhythmical dochmiac (Euripides' Orestes) is a
        //   compound of an iamb + a "lame" paean, a 3+5 time-unit split.
        //   The iamb (short-long, Aristoxenian double ratio 2:1 -- see
        //   docs/PROVENANCE.md, "Rhythm: Aristoxenian genus ratios") sums
        //   to exactly 3 short-note-equivalents (1+2). Lynch calls the
        //   lame paean's exact internal syllable arrangement ambiguous;
        //   this project resolves that ambiguity with a cretic shape
        //   (long-short-long, 2:1:2 -- already sourced elsewhere in this
        //   codebase, see the antiocheneRhythmicCells cretic entries in
        //   midi-generator.ts) for the remaining 3 positions, summing to
        //   the required 5 short-note-equivalents (2+1+2).
        // - West, Ancient Greek Music, p.142: "the
        //   equivalent of eight short notes, divided unequally in groups
        //   of three and five. The paradigm form is [short-long-long-
        //   short-long]" -- independently reached, general paradigm.
        // Whether Lynch's own analysis draws on West's paradigm, or the
        // two independently converge on the same shape, is not confirmed
        // either way from the material on hand -- recorded as an open
        // question, not asserted. See docs/PROVENANCE.md, "Rhythm:
        // dochmiac (Lynch/West convergence)."
        // NOTE: accent array below is not informed by this fix -- Lynch's
        // arsis/thesis diagram for the iamb+lame-paean breakdown has 4
        // elements, not 5, so it doesn't map cleanly onto this 5-position
        // pattern. Left at the same alternating pattern as the other
        // dochmiac entry below rather than guessing at something new.
        "U--U-": {
            duration: [0.5, 1.0, 1.0, 0.5, 1.0],
            accent:   [0, 1, 0, 1, 0],
        }, // Dochmiac (Lynch/West-converged shape)
        
        // "U---U": short-long-long-long-short. This coexists with the
        // separately sourced "U--U-" dochmiac above; neither exact shape
        // supersedes the other in the literal-key matcher. No source in the
        // project currently establishes this exact surface shape; see
        // docs/PROVENANCE.md, "Rhythm: dochmiac (Lynch/West convergence)."
        "U---U": {
            duration: [0.5, 1.0, 1.0, 1.0, 0.5],
            accent:   [0, 1, 0, 1, 0],
        }, // Dochmiac (legacy literal shape; not source-verified in this project)
        
        // "UUU-U-": dochmiac with the first long resolved into two
        // shorts. SOURCE: West, Ancient Greek Music, pp.142-143: "Any of the long notes
        // (but most frequently the first) could be divided into two
        // short ones, except, of course, for the final note of the
        // final bar before a pause." This entry applies that resolution
        // to the first long of "U--U-" above (the most-attested
        // position for it), giving short-short-short-long-short-long.
        // Additive, not a replacement, same as "U--U-"/"U---U" above --
        // verse input is matched foot-by-foot against exact dictionary
        // keys, so all three coexist safely with no collision risk.
        // Per West's own exception, do not use this shape for a
        // dochmiac that is the final foot before a pause in the verse --
        // that specific case is not what this shape represents.
        // The accent array below is this project's own interpretive
        // choice, not itself sourced: the original "-" at this position
        // carried accent=1 (see "U--U-" above); that value is assigned
        // to the first of the two new shorts (the "front half" of the
        // split note), with the second new short at 0 -- one reasonable
        // mapping among others, not asserted as the only correct one.
        "UUU-U-": {
            duration: [0.5, 0.5, 0.5, 1.0, 0.5, 1.0],
            accent:   [0, 1, 0, 0, 1, 0],
        }, // Dochmiac (first long resolved into two shorts)
        
        // === ANCEPS PATTERNS (X represents free position) ===
        "X-":  {
            duration: [0.75, 1.0],
            accent:   [0.5, 1],
        }, // Anceps + long
        "X-U": {
            duration: [0.75, 1.0, 0.5],
            accent:   [0.5, 1, 0],
        }, // Anceps + trochee
        UX:    {
            duration: [0.5, 0.75],
            accent:   [0, 0.5],
        }, // Short + anceps
        "-X":  {
            duration: [1.0, 0.75],
            accent:   [1, 0.5],
        }, // Long + anceps
        XX:    {
            duration: [0.75, 0.75],
            accent:   [0.5, 0.5],
        }, // Double anceps
        
        // === CATALEPTIC (INCOMPLETE) FORMS ===
        // Common in Greek lyric poetry
        "-U-U": {
            duration: [1.0, 0.5, 1.0, 0.5],
            accent:   [1, 0, 1, 0],
        }, // Trochaic dimeter
        "U-U-": {
            duration: [0.5, 1.0, 0.5, 1.0],
            accent:   [0, 1, 0, 1],
        }, // Iambic dimeter
        
        // Note: Resolution patterns are handled by existing Fourth Paeon (UUU-) and First Paeon (-UUU)
    };
    
    // SOURCE: none directly - orchestration. Delegates to the sourced
    // metricalPatterns table above for the actual duration/accent values.
    // Public entry point: converts raw verse input (text + user-supplied
    // metrical notation like "-UU U-") into ProcessedVerse objects that
    // midi-generator.ts consumes.
    processVerses(
        verses: Array<{
            text: string;
            metrics: string;
            arsisThesisPattern?: string;
        }>,
        experimental?: ExperimentalSettings, // Add this parameter
    ): ProcessedVerse[] {
        return verses.map((verse) => this.processVerse(verse,
                                                       experimental));
    }
    
    // SOURCE: none directly - orchestration; see metricalPatterns table
    // above for sourced values. Looks up each user-supplied foot string
    // against the known-patterns table; unrecognized feet fall back to
    // per-syllable expansion (unknown syllable defaults to short/"U").
    private processVerse(
        verse: {
            text: string;
            metrics: string;
            arsisThesisPattern?: string;
        },
        experimental?: ExperimentalSettings,
    ): ProcessedVerse {
        // Parse feet exactly as user provided them (space-separated)
        const feetArray = this.parseFeet(verse.metrics);
        
        // Build metricPatterns from feet
        const metricPatterns: MetricalPattern[] = [];
        const durationTablature: number[] = [];
        const accentTablature: number[] = [];
        
        for (const footStr of feetArray) {
            const pattern = this.metricalPatterns[footStr];
            if (pattern) {
                metricPatterns.push({
                                        foot:      footStr,
                                        durations: pattern.duration,
                                        accents:   pattern.accent,
                                    });
                durationTablature.push(...pattern.duration);
                accentTablature.push(...pattern.accent);
            } else {
                // Handle unknown foot by expanding to individual syllables
                for (const syllable of footStr) {
                    const pat =
                              this.metricalPatterns[syllable] || this.metricalPatterns["U"];
                    metricPatterns.push({
                                            foot:      syllable,
                                            durations: pat.duration,
                                            accents:   pat.accent,
                                        });
                    durationTablature.push(...pat.duration);
                    accentTablature.push(...pat.accent);
                }
            }
        }
        
        // FOOT BOUNDARIES: Based EXCLUSIVELY on user's spaces
        // Each foot ends at the last syllable of that foot
        const footBoundaries: number[] = [];
        let syllableIndex = 0;
        for (const footStr of feetArray) {
            syllableIndex += footStr.length;
            footBoundaries.push(syllableIndex - 1); // last syllable of this foot
            //footBoundaries.push(syllableIndex); // last syllable of this foot
        }
        
        const acuteAccentTablature = this.createAcuteAccentTablature(
            verse.text,
            durationTablature.length,
        );
        
        const processedVerse: ProcessedVerse = {
            text:               verse.text,
            originalMetrics:    verse.metrics,
            metricPatterns,
            durationTablature,
            accentTablature,
            syllableCount:      durationTablature.length,
            footBoundaries,
            arsisThesisPattern: verse.arsisThesisPattern,
            acuteAccentTablature,
        };
        
        // Apply Aristoxenos-based timing
        this.applyAristoxenosTiming(processedVerse,
                                    experimental);
        
        return processedVerse;
    }
    
    private parseSyllables(metricsString: string): Array<{
        char: string;
        duration: number;
        accent: number;
    }> {
        const normalized = metricsString
        .replace(/[—–−]/g,
                 "-")
        .replace(/[υΥ∪]/g,
                 "U");
        
        const syllables = [];
        for (const char of normalized) {
            if (char === " ") continue;
            
            const pattern = this.metricalPatterns[char] || this.metricalPatterns["U"]; // default to short
            
            syllables.push({
                               char,
                               duration: pattern.duration[0],
                               accent:   pattern.accent[0],
                           });
        }
        return syllables;
    }
    
    // @deprecated - live (called from processVerses() below) but confirmed
    // functionally inert: writes verse.pauseAfter, which is checked at 5
    // sites in midi-generator.ts but
    // the actual application is commented out at every one of them (see
    // docs/TODO.md item 1, "5 identical disabled lines... DELIBERATELY
    // DISABLED" -- this function is very likely the original source feeding
    // those checks). Distinct from, and not in conflict with, the actually-
    // audible Aristoxenian mechanism (chronos_ratios rhythmModel in
    // midi-generator.ts, which computes note duration directly) -- that one
    // reaches MIDI output; this one's output is discarded. Left in place
    // and still called per dead-code-in-effect policy (docs/HANDOFF.md) --
    // calling it has no side effect worth removing it for, but it's not
    // doing anything either. See docs/TODO.md, item "Deferred" #2.
    private applyAristoxenosTiming(
        verse: ProcessedVerse,
        experimental?: ExperimentalSettings,
    ): void {
        const chronosProtos = (
            experimental?.baseUnit || 450
        );
        const PAUSE_MS = Math.round(chronosProtos * 0.44);
        
        verse.pauseAfter = {};
        
        // Apply pauses at foot boundaries (after the last syllable of each foot)
        for (const boundary of verse.footBoundaries) {
            // Pause after the boundary syllable (which is the last syllable of the foot)
            if (boundary < verse.syllableCount - 1) {
                // Don't add pause after final syllable
                verse.pauseAfter[boundary] = PAUSE_MS;
            }
        }
    }
    
    /**
     * Creates foot boundaries based EXCLUSIVELY on the user's spacing
     * (Each space in the input marks a foot boundary)
     */
    private createExplicitFootBoundaries(metricsString: string): number[] {
        const boundaries: number[] = [];
        let currentPos = 0;
        
        // Split by spaces to get foot positions
        const feet = metricsString.trim().split(/\s+/).filter(Boolean);
        for (const foot of feet) {
            currentPos += foot.length;
            boundaries.push(currentPos - 1); // last syllable of foot
        }
        
        return boundaries;
    }
    
    private parseMetrics_OLD(metricsString: string): MetricalPattern[] {
        // Normalize Greek notation to standard ASCII
        const normalized = metricsString
        .replace(/[—–−]/g,
                 "-") // Em dash, en dash, minus to hyphen
        .replace(/[υΥ]/g,
                 "U") // Greek upsilon (small & capital) to uppercase U
        .replace(/[∪]/g,
                 "U"); // Unicode breve to U
        
        // Split by spaces to get individual metric feet
        const feet = normalized.trim().split(/\s+/).filter(Boolean);
        const patterns: MetricalPattern[] = [];
        
        for (const foot of feet) {
            if (this.metricalPatterns[foot]) {
                patterns.push({
                                  foot,
                                  durations: this.metricalPatterns[foot].duration,
                                  accents:   this.metricalPatterns[foot].accent,
                              });
            } else {
                // Handle unknown patterns by treating each character as individual syllable
                const individualSyllables = foot.split("");
                for (const syllable of individualSyllables) {
                    if (this.metricalPatterns[syllable]) {
                        patterns.push({
                                          foot:      syllable,
                                          durations: this.metricalPatterns[syllable].duration,
                                          accents:   this.metricalPatterns[syllable].accent,
                                      });
                    }
                }
            }
        }
        
        return patterns;
    }
    
    private parseMetrics(metricsString: string): string[] {
        return metricsString
        .replace(/[—–−]/g,
                 "-")
        .replace(/[υΥ]/g,
                 "U")
        .replace(/[∪]/g,
                 "U")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    }
    
    private createDurationTablature(metricPatterns: MetricalPattern[]): number[] {
        const durations: number[] = [];
        for (const pattern of metricPatterns) {
            durations.push(...pattern.durations);
        }
        return durations;
    }
    
    private parseFeet(metricsString: string): string[] {
        return metricsString
        .replace(/[—–−]/g,
                 "-")
        .replace(/[υΥ]/g,
                 "U")
        .replace(/[∪]/g,
                 "U")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    }
    
    private createAccentTablature(metricPatterns: MetricalPattern[]): number[] {
        const accents: number[] = [];
        for (const pattern of metricPatterns) {
            accents.push(...pattern.accents);
        }
        return accents;
    }
    
    private countSyllables(text: string): number {
        // Count syllables by counting vowel groups (more accurate for Greek)
        // Each vowel or vowel cluster counts as one syllable
        const vowelPattern = /[αεηιοωυάέήίόύώΑΕΗΙΟΩΥΆΈΉΊΌΎΏ]+/g;
        const vowelGroups = text.match(vowelPattern);
        return vowelGroups ? vowelGroups.length : 0;
    }
    
    private createAcuteAccentTablature(
        text: string,
        syllableCount: number,
    ): boolean[] {
        const syllables = text.split(/[-\s]+/); // Split on hyphens and spaces
        const acuteChars = [
            "ά",
            "ἄ",
            "ἅ",
            "Ά",
            "Ἄ",
            "Ἅ",
            "έ",
            "ἔ",
            "ἕ",
            "Έ",
            "Ἔ",
            "Ἕ",
            "ή",
            "ἤ",
            "ἥ",
            "Ή",
            "Ἤ",
            "Ἥ",
            "ί",
            "ἴ",
            "ἵ",
            "Ί",
            "Ἴ",
            "Ἵ",
            "ό",
            "ὄ",
            "ὅ",
            "Ό",
            "Ὄ",
            "Ὅ",
            "ύ",
            "ὔ",
            "ὕ",
            "Ύ",
            "Ὕ",
            "Ὕ",
            "ώ",
            "ὤ",
            "ὥ",
            "Ώ",
            "Ὤ",
            "Ὥ",
        ];
        
        return syllables.map((syllable) =>
                                 acuteChars.some((accent) => syllable.includes(accent)),
        );
    }
}
